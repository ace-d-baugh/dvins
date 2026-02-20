import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  TouchableOpacity,
  Alert,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from 'react-native-vector-icons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const NotificationSettingsScreen = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isGlobalEnabled, setIsGlobalEnabled] = useState(false);
  const [attractions, setAttractions] = useState([]);
  const [userPreferences, setUserPreferences] = useState({});
  const navigation = useNavigation();

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      // Get user token
      const userToken = await AsyncStorage.getItem('userToken');
      if (!userToken) {
        Alert.alert('Error', 'Please log in first');
        navigation.navigate('Login');
        return;
      }

      // Get user preferences
      const response = await axios.get('http://localhost:3000/api/users/preferences', {
        headers: {
          'Authorization': `Bearer ${userToken}`
        }
      });

      const userData = response.data;
      const preferences = userData.notification_prefs || [];
      
      // Get all attractions
      const attractionsResponse = await axios.get('http://localhost:3000/api/attractions');
      const allAttractions = attractionsResponse.data;

      // Format data
      const formattedPrefs = {};
      preferences.forEach(pref => {
        formattedPrefs[pref.attraction_id] = {
          threshold: pref.threshold_minutes,
          reopening_alert: pref.reopening_alert === 1,
          is_active: pref.is_active === 1
        };
      });

      setAttractions(allAttractions);
      setUserPreferences(formattedPrefs);
      setIsGlobalEnabled(userData.notifications_enabled === 1);
    } catch (error) {
      Alert.alert('Error', 'Failed to load notification settings');
      console.error('Error loading settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveSettings = async () => {
    try {
      setIsLoading(true);
      
      const userToken = await AsyncStorage.getItem('userToken');
      if (!userToken) {
        Alert.alert('Error', 'Please log in first');
        return;
      }

      const preferences = [];
      attractions.forEach(attraction => {
        const pref = userPreferences[attraction.id];
        if (pref) {
          preferences.push({
            attraction_id: attraction.id,
            threshold_minutes: pref.threshold,
            reopening_alert: pref.reopening_alert ? 1 : 0,
            is_active: pref.is_active ? 1 : 0
          });
        }
      });

      await axios.put('http://localhost:3000/api/users/preferences', {
        notifications_enabled: isGlobalEnabled ? 1 : 0,
        preferences: preferences
      }, {
        headers: {
          'Authorization': `Bearer ${userToken}`
        }
      });

      Alert.alert('Success', 'Notification settings saved');
    } catch (error) {
      Alert.alert('Error', 'Failed to save notification settings');
      console.error('Error saving settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleGlobalNotifications = async (value) => {
    setIsGlobalEnabled(value);
    
    // Update all preferences when global toggle changes
    const updatedPrefs = { ...userPreferences };
    Object.keys(updatedPrefs).forEach(key => {
      updatedPrefs[key].is_active = value;
    });
    setUserPreferences(updatedPrefs);
  };

  const toggleAttractionNotification = (attractionId, value) => {
    const updatedPrefs = { ...userPreferences };
    if (!updatedPrefs[attractionId]) {
      updatedPrefs[attractionId] = {
        threshold: 15, // default threshold
        reopening_alert: false,
        is_active: value
      };
    } else {
      updatedPrefs[attractionId].is_active = value;
    }
    setUserPreferences(updatedPrefs);
  };

  const updateThreshold = (attractionId, value) => {
    const updatedPrefs = { ...userPreferences };
    if (!updatedPrefs[attractionId]) {
      updatedPrefs[attractionId] = {
        threshold: value,
        reopening_alert: false,
        is_active: true
      };
    } else {
      updatedPrefs[attractionId].threshold = value;
    }
    setUserPreferences(updatedPrefs);
  };

  const toggleReopeningAlert = (attractionId, value) => {
    const updatedPrefs = { ...userPreferences };
    if (!updatedPrefs[attractionId]) {
      updatedPrefs[attractionId] = {
        threshold: 15,
        reopening_alert: value,
        is_active: true
      };
    } else {
      updatedPrefs[attractionId].reopening_alert = value;
    }
    setUserPreferences(updatedPrefs);
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading notification settings...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Global Notifications Toggle */}
        <View style={styles.section}>
          <View style={styles.rowContainer}>
            <Text style={styles.sectionTitle}>Global Notifications</Text>
            <Switch
              value={isGlobalEnabled}
              onValueChange={toggleGlobalNotifications}
              trackColor={{ false: '#767577', true: '#81b0ff' }}
              thumbColor={isGlobalEnabled ? '#f5dd4b' : '#f4f3f4'}
            />
          </View>
          {isGlobalEnabled && (
            <Text style={styles.sectionDescription}>
              Enable/disable all attraction notifications
            </Text>
          )}
        </View>

        {/* Attractions List */}
        {isGlobalEnabled && attractions.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Attraction Notifications</Text>
            {attractions.map((attraction) => (
              <View key={attraction.id} style={styles.attractionCard}>
                {/* Attraction Header */}
                <View style={styles.attractionHeader}>
                  <View style={styles.attractionInfo}>
                    <Text style={styles.attractionName}>{attraction.name}</Text>
                    <Text style={styles.attractionPark}>
                      {attraction.park_name}
                    </Text>
                  </View>
                  <Switch
                    value={userPreferences[attraction.id]?.is_active || false}
                    onValueChange={(value) => toggleAttractionNotification(attraction.id, value)}
                    trackColor={{ false: '#767577', true: '#81b0ff' }}
                    thumbColor={userPreferences[attraction.id]?.is_active ? '#f5dd4b' : '#f4f3f4'}
                    disabled={!isGlobalEnabled}
                  />
                </View>

                {/* Notification Settings */}
                {userPreferences[attraction.id]?.is_active && (
                  <View style={styles.settingsContainer}>
                    {/* Threshold Settings */}
                    <View style={styles.settingRow}>
                      <Text style={styles.settingLabel}>Wait Time Threshold</Text>
                      <View style={styles.thresholdContainer}>
                        <TouchableOpacity
                          style={styles.thresholdButton}
                          onPress={() => updateThreshold(attraction.id, 5)}
                        >
                          <Text style={[
                            styles.thresholdText,
                            userPreferences[attraction.id]?.threshold === 5 && styles.thresholdActive
                          ]}>5 min</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.thresholdButton}
                          onPress={() => updateThreshold(attraction.id, 10)}
                        >
                          <Text style={[
                            styles.thresholdText,
                            userPreferences[attraction.id]?.threshold === 10 && styles.thresholdActive
                          ]}>10 min</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.thresholdButton}
                          onPress={() => updateThreshold(attraction.id, 15)}
                        >
                          <Text style={[
                            styles.thresholdText,
                            userPreferences[attraction.id]?.threshold === 15 && styles.thresholdActive
                          ]}>15 min</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.thresholdButton}
                          onPress={() => updateThreshold(attraction.id, 30)}
                        >
                          <Text style={[
                            styles.thresholdText,
                            userPreferences[attraction.id]?.threshold === 30 && styles.thresholdActive
                          ]}>30 min</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.thresholdButton}
                          onPress={() => updateThreshold(attraction.id, 60)}
                        >
                          <Text style={[
                            styles.thresholdText,
                            userPreferences[attraction.id]?.threshold === 60 && styles.thresholdActive
                          ]}>60 min</Text>
                        </TouchableOpacity>
                      </View>
                    </View>

                    {/* Reopening Alert */}
                    <View style={styles.settingRow}>
                      <Text style={styles.settingLabel}>Reopening Alerts</Text>
                      <Switch
                        value={userPreferences[attraction.id]?.reopening_alert || false}
                        onValueChange={(value) => toggleReopeningAlert(attraction.id, value)}
                        trackColor={{ false: '#767577', true: '#81b0ff' }}
                        thumbColor={userPreferences[attraction.id]?.reopening_alert ? '#f5dd4b' : '#f4f3f4'}
                        disabled={!isGlobalEnabled}
                      />
                    </View>
                  </View>
                )}
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Save Button */}
      <TouchableOpacity
        style={styles.saveButton}
        onPress={saveSettings}
        disabled={isLoading}
      >
        <Text style={styles.saveButtonText}>Save Settings</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  section: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  sectionDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  attractionCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  attractionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  attractionInfo: {
    flex: 1,
  },
  attractionName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  attractionPark: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  settingsContainer: {
    backgroundColor: 'white',
    borderRadius: 6,
    padding: 12,
    marginTop: 8,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  settingLabel: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  thresholdContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  thresholdButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    backgroundColor: '#f0f0f0',
    minWidth: 40,
    alignItems: 'center',
    marginHorizontal: 2,
  },
  thresholdText: {
    fontSize: 12,
    color: '#666',
  },
  thresholdActive: {
    color: '#007AFF',
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    marginHorizontal: 16,
    marginBottom: 20,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default NotificationSettingsScreen;