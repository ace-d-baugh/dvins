import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from './screens/HomeScreen';
import LoginScreen from './screens/LoginScreen';
import NotificationSettingsScreen from './screens/NotificationSettingsScreen';
import PushNotificationHandler from './services/PushNotificationHandler';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <PushNotificationHandler />
      <Stack.Navigator initialRouteName='Login'>
        <Stack.Screen
          name='Login'
          component={LoginScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name='Home'
          component={HomeScreen}
          options={{
            title: 'D'VINS',
            headerStyle: { backgroundColor: '#007AFF' },
            headerTintColor: 'white',
            headerTitleStyle: { fontWeight: 'bold' }
          }}
        />
        <Stack.Screen
          name='NotificationSettings'
          component={NotificationSettingsScreen}
          options={{
            title: 'Notification Settings',
            headerStyle: { backgroundColor: '#007AFF' },
            headerTintColor: 'white',
            headerTitleStyle: { fontWeight: 'bold' }
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;