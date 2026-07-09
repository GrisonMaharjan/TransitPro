import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Auth screens
import WelcomeScreen from '../screens/auth/WelcomeScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';

// Passenger screens
import DashboardScreen from '../screens/passenger/DashboardScreen';
import NFCTapScreen from '../screens/passenger/NFCTapScreen';
import WalletScreen from '../screens/passenger/WalletScreen';
import TripHistoryScreen from '../screens/passenger/TripHistoryScreen';
import ProfileScreen from '../screens/passenger/ProfileScreen';
import FareListScreen from '../screens/passenger/FareListScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Welcome"
        screenOptions={{ headerShown: false, animation: 'slide_from_right' }}
      >
        {/* Auth Flow */}
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />

        {/* App Flow */}
        <Stack.Screen name="Dashboard" component={DashboardScreen} />
        <Stack.Screen name="NFCTap" component={NFCTapScreen} />
        <Stack.Screen name="Wallet" component={WalletScreen} />
        <Stack.Screen name="TripHistory" component={TripHistoryScreen} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
        <Stack.Screen name="FareList" component={FareListScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}