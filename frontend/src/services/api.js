import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

const getBaseUrl = () => {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }
  // Physical mobile device running Expo Go
  const hostUri = Constants.expoConfig?.hostUri || Constants.manifest?.debuggerHost;
  if (hostUri) {
    const ip = hostUri.split(':')[0];
    return `http://${ip}:5000/api`;
  }
  // Android Emulator
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:5000/api';
  }
  // iOS Simulator / Web default
  return 'http://localhost:5000/api';
};

const BASE_URL = getBaseUrl();

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT token to every request
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle 401 responses
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await AsyncStorage.multiRemove(['token', 'user']);
    }
    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (data) => api.post('/auth/register', data),
  getMe: () => api.get('/auth/me'),
};

// Event APIs
export const eventAPI = {
  getEvents: (params) => api.get('/events', { params }),
  getEventById: (id) => api.get(`/events/${id}`),
  createEvent: (data) => api.post('/events', data),
  updateEvent: (id, data) => api.put(`/events/${id}`, data),
  deleteEvent: (id) => api.delete(`/events/${id}`),
  getMyOrganizedEvents: () => api.get('/events/organizer/my-events'),
};

// Category APIs
export const categoryAPI = {
  getCategories: () => api.get('/categories'),
};

// Registration APIs
export const registrationAPI = {
  registerForEvent: (eventId) => api.post(`/registrations/events/${eventId}`),
  cancelRegistration: (id) => api.put(`/registrations/${id}/cancel`),
  getMyTickets: () => api.get('/registrations/my-tickets'),
  getEventParticipants: (eventId) => api.get(`/registrations/events/${eventId}/participants`),
};

export default api;
