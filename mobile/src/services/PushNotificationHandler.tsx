import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  PermissionsAndroid,
  Platform,
  Alert,
  AppState,
  AppStateStatus
} from 'react-native';
import messaging from '@react-native-firebase/messaging';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PushNotificationHandler = () => {
  const [appState, setAppState] = useState(AppState.currentState);

  useEffect(() => {
    requestUserPermission();
    
    // Listen for app state changes
    AppState.addEventListener('change', handleAppStateChange);
    
    // Listen for incoming messages
    const unsubscribe = messaging().onMessage(async (remoteMessage) => {
      Alert.alert('New Notification', remoteMessage.notification?.body);
    });
    
    // Get FCM token
    messaging()
      .getToken()
      .then(token => {
        if (token) {
          console.log('FCM Token:', token);
          saveFCMToken(token);
        }
      });
    
    // Handle notification tap
    messaging()
      .onNotificationOpenedApp((remoteMessage) => {
        console.log('Notification caused app to open from background state:', remoteMessage);
        handleNotificationTap(remoteMessage);
      });
    
    // Handle cold start from notification
    messaging()
      .getInitialNotification()
      .then((remoteMessage) => {
        if (remoteMessage) {
          console.log('Notification caused app to open from closed state:', remoteMessage);
          handleNotificationTap(remoteMessage);
        }
      });

    return () => {
      unsubscribe();
      AppState.removeEventListener('change', handleAppStateChange);
    };
  }, []);

  const requestUserPermission = async () => {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.RECEIVE_SMS,
        {
          title: 'D'VINS Notifications',
          message: 'D'VINS needs access to notifications to alert you about wait times.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        console.log('Notification permission granted');
      } else {
        console.log('Notification permission denied');
      }
    } else {
      // iOS
      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;
      
      if (enabled) {
        console.log('Notification permission granted');
      } else {
        console.log('Notification permission denied');
      }
    }
  };

  const saveFCMToken = async (token: string) => {
    try {
      const userToken = await AsyncStorage.getItem('userToken');
      if (userToken) {
        // Send token to backend
        await fetch('http://localhost:3000/api/users/token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${userToken}`,
          },
          body: JSON.stringify({ fcm_token: token }),
        });
      }
    } catch (error) {
      console.error('Error saving FCM token:', error);
    }
  };

  const handleAppStateChange = (nextAppState: AppStateStatus) => {
    if (appState.match(/inactive|background/) && nextAppState === 'active') {
      console.log('App has come to the foreground!');
      messaging()
        .getToken()
        .then(token => {
          if (token) {
            console.log('FCM Token:', token);
            saveFCMToken(token);
          }
        });
    }
    setAppState(nextAppState);
  };

  const handleNotificationTap = (remoteMessage: any) => {
    const attractionId = remoteMessage.data?.attraction_id;
    const notificationType = remoteMessage.data?.type;
    
    console.log('Notification tapped:', {
      attractionId,
      type: notificationType
    });
    
    // Handle navigation to attraction
    // This would be implemented in the navigation context
    console.log(`Navigate to attraction ${attractionId} for notification type ${notificationType}`);
  };

  return null;
};

export default PushNotificationHandler;