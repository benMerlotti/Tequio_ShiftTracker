// src/navigation/appNavigator.js
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'react-native';

import AuthScreen from '../screens/authScreen';
import DashboardScreen from '../screens/dashboardScreen';
import ShiftActivityScreen from '../screens/shiftActivityScreen';
import FeedbackCollectionScreen from '../screens/feedbackCollectionScreen';
import DatabaseExplorerScreen from '../screens/databaseExploreScreen';

const MainStack = createStackNavigator();
const AuthStack = createStackNavigator();

// Screens shown after login
const MainNavigator = () => {
  return (
    <MainStack.Navigator initialRouteName="Dashboard">
      <MainStack.Screen name="Dashboard" component={DashboardScreen} />
      <MainStack.Screen name="ShiftActivity" component={ShiftActivityScreen} />
      <MainStack.Screen name="FeedbackCollection" component={FeedbackCollectionScreen} />
      <MainStack.Screen name="DatabaseExplorer" component={DatabaseExplorerScreen} />
    </MainStack.Navigator>
  );
};

// Screens shown before login
const AuthNavigator = () => {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Auth" component={AuthScreen} />
    </AuthStack.Navigator>
  );
};

// Top-level navigator that chooses Auth or Main based on auth status
const AppNavigator = ({ isAuth }) => {
  return (
    <>
      <StatusBar barStyle="dark-content" />
      <NavigationContainer>
        {isAuth ? <MainNavigator /> : <AuthNavigator />}
      </NavigationContainer>
    </>
  );
};

export default AppNavigator;