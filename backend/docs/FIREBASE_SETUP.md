# Firebase Cloud Messaging (FCM) Integration

## Setup

1. **Create Firebase Project**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Click "Add project" and name it `dvins-notifications`
   - Follow the setup wizard

2. **Add Android App**
   - In Firebase Console, click "Add app" and select Android
   - Package name: `com.dvins.app`
   - Download `google-services.json` and place it in the Android app's root directory

3. **Add iOS App**
   - In Firebase Console, click "Add app" and select iOS
   - Bundle ID: `com.dvins.app`
   - Download `GoogleService-Info.plist` and place it in the iOS app's root directory

4. **Install Firebase SDKs**
   ```bash
   # In backend (already done)
npm install firebase-admin

   # In mobile app (to be created)
npm install @react-native-firebase/app @react-native-firebase/messaging
   ```

## Backend Configuration

1. **Initialize Firebase Admin SDK**
   ```javascript
   // In notificationEngine.js
   const admin = require('firebase-admin');
   
   admin.initializeApp({
     credential: admin.credential.applicationDefault(),
     databaseURL: 'https://dvins-notifications.firebaseio.com'
   });
   ```

2. **Notification Service**
   The notification service runs every 5 minutes and:
   - Checks user notification preferences
   - Evaluates wait time thresholds
   - Detects attraction reopenings
   - Sends FCM messages to subscribed devices

## Notification Engine Workflow

1. **Fetch User Preferences**
   - Get all active notification preferences for each user
   - Join with attraction names for display

2. **Check Wait Time Conditions**
   - Get latest wait time for each attraction
   - Compare with user's threshold
   - Check for reopening alerts (closed → open transitions)

3. **Send Notifications**
   - Construct FCM message with title, body, and data
   - Send to user's device token
   - Handle success/error responses

## Notification Payload Structure

```json
{
  "to": "device_fcm_token",
  "notification": {
    "title": "Space Mountain - 25 min wait",
    "body": "Wait time dropped below your threshold!"
  },
  "data": {
    "attraction_id": "123",
    "type": "threshold_met"
  }
}
```

## Testing

1. **Backend Testing**
   - Test notification evaluation logic
   - Verify FCM message sending
   - Check threshold calculations

2. **Mobile Testing**
   - Test notification settings UI
   - Verify push notification delivery
   - Test deep linking functionality

## Security Considerations

- Device tokens are stored securely in the database
- FCM messages are validated and sanitized
- Error handling prevents notification spam
- Rate limiting prevents abuse