const admin = require('firebase-admin');
const { all, get } = require('../database/connection');

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  databaseURL: 'https://dvins-notifications.firebaseio.com'
});

const messaging = admin.messaging();

// Get attraction wait time
const getAttractionWaitTime = async (attractionId) => {
  const result = await get(
    `SELECT wait_minutes, status 
     FROM wait_times_cache 
     WHERE attraction_id = ? 
     ORDER BY fetched_at DESC LIMIT 1`,
    [attractionId]
  );
  return result;
};

// Get user notification preferences
const getUserNotificationPrefs = async (userId) => {
  const results = await all(
    `SELECT np.*, a.name as attraction_name 
     FROM notification_prefs np 
     JOIN attractions a ON np.attraction_id = a.id 
     WHERE np.user_id = ? AND np.is_active = 1`,
    [userId]
  );
  return results;
};

// Check if attraction reopened
const checkAttractionReopening = async (attractionId, currentStatus) => {
  const result = await get(
    `SELECT status 
     FROM wait_times_cache 
     WHERE attraction_id = ? 
     ORDER BY fetched_at DESC LIMIT 2`,
    [attractionId]
  );
  
  if (!result || !result.status) return false;
  
  // Check if status changed from closed to open
  return result.status === 'closed' && currentStatus !== 'closed';
};

// Send FCM notification
const sendFCMNotification = async (deviceToken, notificationData) => {
  try {
    const message = {
      notification: {
        title: notificationData.title,
        body: notificationData.body
      },
      data: notificationData.data,
      token: deviceToken
    };

    const response = await messaging.send(message);
    console.log('Successfully sent message:', response);
    return response;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};

// Process notifications for a user
const processUserNotifications = async (user) => {
  try {
    const prefs = await getUserNotificationPrefs(user.id);
    
    for (const pref of prefs) {
      const waitTimeData = await getAttractionWaitTime(pref.attraction_id);
      
      if (!waitTimeData) continue;
      
      const { wait_minutes: currentWait, status } = waitTimeData;
      const { threshold_minutes, reopening_alert, attraction_name } = pref;
      
      // Check threshold notification
      if (currentWait <= threshold_minutes) {
        const notificationData = {
          title: `${attraction_name} - ${currentWait} min wait`,
          body: `Wait time dropped below your threshold!`,
          data: {
            attraction_id: pref.attraction_id.toString(),
            type: 'threshold_met'
          }
        };
        
        await sendFCMNotification(user.device_token, notificationData);
        console.log(`Sent threshold notification for ${attraction_name} to user ${user.id}`);
      }
      
      // Check reopening notification
      if (reopening_alert && await checkAttractionReopening(pref.attraction_id, status)) {
        const notificationData = {
          title: `${attraction_name} has reopened!`,
          body: `The attraction is now open!`,
          data: {
            attraction_id: pref.attraction_id.toString(),
            type: 'reopening'
          }
        };
        
        await sendFCMNotification(user.device_token, notificationData);
        console.log(`Sent reopening notification for ${attraction_name} to user ${user.id}`);
      }
    }
  } catch (error) {
    console.error(`Error processing notifications for user ${user.id}:`, error);
  }
};

// Main notification evaluation function
const evaluateNotifications = async () => {
  try {
    console.log(`[${new Date().toISOString()}] Evaluating notifications...`);
    
    // Get all users with device tokens
    const users = await all(
      `SELECT id, device_token FROM users WHERE device_token IS NOT NULL`
    );
    
    for (const user of users) {
      if (user.device_token) {
        await processUserNotifications(user);
      }
    }
    
    console.log(`[${new Date().toISOString()}] Notification evaluation complete.`);
  } catch (error) {
    console.error('Error in notification evaluation:', error);
  }
};

module.exports = {
  evaluateNotifications,
  sendFCMNotification,
  getUserNotificationPrefs,
  getAttractionWaitTime,
  checkAttractionReopening
};