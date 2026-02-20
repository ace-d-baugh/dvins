# Firebase Setup for D'VINS

## Project Configuration
- **Project ID:** dvins-app
- **Project Name:** D'VINS
- **Region:** us-central1 (default)

## Apps Added
- **Android:** com.dvins.app
- **iOS:** com.dvins.app

## Firebase Services Configured
- Authentication (Email/Password)
- Cloud Firestore (for future use)
- Analytics (optional)
- Crashlytics (optional)

## Config Files
- `config/firebase/android/google-services.json`
- `config/firebase/ios/GoogleService-Info.plist`
- `config/firebase/firebase.json`
- `config/firebase/.firebaserc`

## Setup Instructions
1. Install Firebase CLI: `npm install -g firebase-tools`
2. Login: `firebase login`
3. Initialize: `firebase init` (select Firestore, Functions, Hosting)
4. Deploy: `firebase deploy`

## Environment Variables
See `.env.example` files for required configuration.

## Security Rules
Cloud Firestore rules configured for development (tighten for production).

## Authentication
Email/Password authentication enabled. Additional providers can be added as needed.

## Database Structure
SQLite tables (see `dvins-backend/src/database/schema.sql`):
- users
- parks
- attractions
- wait_times_cache
- favorites
- notification_prefs

## Next Steps
- Configure environment variables
- Set up CI/CD pipelines
- Deploy to staging/production

## Troubleshooting
- Check Firebase Console for project status
- Verify `google-services.json` and `GoogleService-Info.plist` are in correct locations
- Ensure Firebase Auth Email/Password provider is enabled
