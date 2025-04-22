import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'react-native';

import AuthScreen from '../screens/authScreen';
import DashboardScreen from '../screens/DashboardScreen';
import ShiftLogScreen from '../screens/ShiftLogScreen';
import StoreLocationsScreen from '../screens/StoreLocationsScreen';
import FeedbackScreen from '../screens/FeedbackScreen';

const MainStack = createStackNavigator();
const AuthStack = createStackNavigator();

const AuthNavigator = () => {
  return (
    
      
    
  );
};

const MainNavigator = () => {
  return (
    
      
      
      
      
    
  );
};

const AppNavigator = ({ isAuth }) => {
  return (
    
      
      {isAuth ?  : }
    
  );
};

export default AppNavigator;