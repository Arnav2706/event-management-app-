import React, { createContext, useContext, useReducer, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authAPI } from '../services/api';

const AuthContext = createContext();

const initialState = {
  user: null,
  token: null,
  isLoading: true,
  error: null,
};

function authReducer(state, action) {
  switch (action.type) {
    case 'RESTORE_TOKEN':
      return { ...state, token: action.token, user: action.user, isLoading: false };
    case 'LOGIN':
      return { ...state, token: action.token, user: action.user, error: null };
    case 'LOGOUT':
      return { ...state, token: null, user: null, error: null };
    case 'SET_ERROR':
      return { ...state, error: action.error };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    case 'SET_LOADING':
      return { ...state, isLoading: action.isLoading };
    default:
      return state;
  }
}

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Restore token on app launch
  useEffect(() => {
    (async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        const userStr = await AsyncStorage.getItem('user');
        const user = userStr ? JSON.parse(userStr) : null;
        dispatch({ type: 'RESTORE_TOKEN', token, user });
      } catch (e) {
        dispatch({ type: 'RESTORE_TOKEN', token: null, user: null });
      }
    })();
  }, []);

  const login = async (email, password) => {
    try {
      dispatch({ type: 'CLEAR_ERROR' });
      dispatch({ type: 'SET_LOADING', isLoading: true });
      const { data } = await authAPI.login(email, password);
      if (data.success) {
        await AsyncStorage.setItem('token', data.token);
        await AsyncStorage.setItem('user', JSON.stringify(data.user));
        dispatch({ type: 'LOGIN', token: data.token, user: data.user });
      }
      return data;
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed';
      dispatch({ type: 'SET_ERROR', error: message });
      throw new Error(message);
    } finally {
      dispatch({ type: 'SET_LOADING', isLoading: false });
    }
  };

  const register = async (name, email, password, role) => {
    try {
      dispatch({ type: 'CLEAR_ERROR' });
      dispatch({ type: 'SET_LOADING', isLoading: true });
      const { data } = await authAPI.register({ name, email, password, role });
      if (data.success) {
        await AsyncStorage.setItem('token', data.token);
        await AsyncStorage.setItem('user', JSON.stringify(data.user));
        dispatch({ type: 'LOGIN', token: data.token, user: data.user });
      }
      return data;
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed';
      dispatch({ type: 'SET_ERROR', error: message });
      throw new Error(message);
    } finally {
      dispatch({ type: 'SET_LOADING', isLoading: false });
    }
  };

  const logout = async () => {
    await AsyncStorage.multiRemove(['token', 'user']);
    dispatch({ type: 'LOGOUT' });
  };

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
