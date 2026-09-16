import React from 'react';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import { useAuth } from '../context/AuthContext';
import { COLORS, FONT_SIZES } from '../constants/theme';

// Auth Screens
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';

// Core Screens
import HomeScreen from '../screens/HomeScreen';
import EventDetailsScreen from '../screens/EventDetailsScreen';
import MyTicketsScreen from '../screens/MyTicketsScreen';
import OrganizerDashboardScreen from '../screens/OrganizerDashboardScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Discovery Stack (Home -> Event Details)
function DiscoveryStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HomeFeed" component={HomeScreen} />
      <Stack.Screen name="EventDetails" component={EventDetailsScreen} />
    </Stack.Navigator>
  );
}

// Participant Tabs
function ParticipantTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.outline,
        tabBarLabelStyle: styles.tabLabel,
        tabBarIcon: ({ color, size, focused }) => {
          let iconName;
          if (route.name === 'HomeTab') {
            iconName = focused ? 'compass' : 'compass-outline';
          } else if (route.name === 'TicketsTab') {
            iconName = focused ? 'ticket' : 'ticket-outline';
          } else if (route.name === 'ProfileTab') {
            iconName = focused ? 'person' : 'person-outline';
          }
          return <Ionicons name={iconName} size={22} color={color} />;
        },
      })}
    >
      <Tab.Screen name="HomeTab" component={DiscoveryStack} options={{ tabBarLabel: 'Discovery' }} />
      <Tab.Screen name="TicketsTab" component={MyTicketsScreen} options={{ tabBarLabel: 'Passes' }} />
      <Tab.Screen name="ProfileTab" component={ProfileScreen} options={{ tabBarLabel: 'Dossier' }} />
    </Tab.Navigator>
  );
}

// Organizer Tabs
function OrganizerTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.outline,
        tabBarLabelStyle: styles.tabLabel,
        tabBarIcon: ({ color, size, focused }) => {
          let iconName;
          if (route.name === 'CuratorTab') {
            iconName = focused ? 'diamond' : 'diamond-outline';
          } else if (route.name === 'BrowseTab') {
            iconName = focused ? 'compass' : 'compass-outline';
          } else if (route.name === 'ProfileTab') {
            iconName = focused ? 'person' : 'person-outline';
          }
          return <Ionicons name={iconName} size={22} color={color} />;
        },
      })}
    >
      <Tab.Screen
        name="CuratorTab"
        component={OrganizerDashboardScreen}
        options={{ tabBarLabel: 'Curator' }}
      />
      <Tab.Screen
        name="BrowseTab"
        component={DiscoveryStack}
        options={{ tabBarLabel: 'Discovery' }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileScreen}
        options={{ tabBarLabel: 'Dossier' }}
      />
    </Tab.Navigator>
  );
}

// Auth Stack
function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
}

// Root Navigator
export default function AppNavigator() {
  const { token, user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={styles.splashWrap}>
        <View style={styles.splashMonogram}>
          <Text style={styles.splashMonogramText}>E</Text>
        </View>
        <Text style={styles.splashTitle}>THE ATELIER</Text>
        <ActivityIndicator size="small" color={COLORS.primary} style={{ marginTop: 24 }} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {!token ? (
        <AuthStack />
      ) : user?.role === 'organizer' ? (
        <OrganizerTabs />
      ) : (
        <ParticipantTabs />
      )}
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.outlineVariant,
    height: 64,
    paddingBottom: 8,
    paddingTop: 8,
  },
  tabLabel: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  splashWrap: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  splashMonogram: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 2,
    borderColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surfaceContainer,
  },
  splashMonogramText: {
    color: COLORS.primary,
    fontSize: 34,
    fontWeight: '800',
  },
  splashTitle: {
    color: COLORS.champagne,
    fontSize: FONT_SIZES.sm,
    fontWeight: '800',
    letterSpacing: 3,
    marginTop: 18,
  },
});
