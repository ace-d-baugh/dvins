# D'VINS - Disney Very Important Notification System

A cross-platform mobile application for tracking Walt Disney World attraction wait times with real-time notifications.

## Overview

D'VINS helps Disney World guests make informed decisions about their park experience by providing:
- Real-time wait times for all four parks
- Push notifications when wait times hit your thresholds
- Trend indicators showing if waits are increasing or decreasing
- Favorites system to track your must-do attractions

## Architecture

```
dvins/
├── backend/          # Express API + SQLite (polls Queue-Times API)
├── mobile/           # React Native app (iOS & Android)
├── docs/             # Setup guides and documentation
└── planning/         # Planning documents (PRD, BRD, architecture, design)
```

## Tech Stack

| Component | Technology |
|-----------|------------|
| Backend | Node.js, Express, SQLite |
| Mobile | React Native, TypeScript |
| Auth | JWT + email verification |
| Notifications | Firebase Cloud Messaging |
| Data Source | Queue-Times API |

## Prerequisites

### Required for All Platforms
- **Node.js** 18+ ([Download](https://nodejs.org/))
- **Git** ([Download](https://git-scm.com/))
- **Firebase account** (free tier)

### For Backend
- Nothing else needed (SQLite is built-in)

### For Android Development
- **Android Studio** ([Download](https://developer.android.com/studio))
- **Android SDK** (installed via Android Studio)
- **Java JDK** 11 or 17

### For iOS Development
- **Mac computer** (required for iOS)
- **Xcode** ([App Store](https://apps.apple.com/us/app/xcode/id497799835))
- **CocoaPods** (`sudo gem install cocoapods`)

## Quick Start (5 Minutes)

### 1. Clone & Navigate
```bash
git clone https://github.com/ace-d-baugh/dvins.git
cd dvins
```

### 2. Start the Backend
```bash
cd backend
npm install
npm run db:init
npm run dev
```
Backend runs at `http://localhost:3000`

### 3. In Another Terminal - Mobile Setup
```bash
cd mobile
npm install
```

### 4. Environment Setup
Copy the example environment files and fill in:

**Backend** (`backend/.env`):
```bash
PORT=3000
JWT_SECRET=your-secret-key-here
EMAIL_SERVICE=sendgrid
SENDGRID_API_KEY=your-api-key
FROM_EMAIL=noreply@dvins.app
```

**Mobile** (`mobile/.env`):
```bash
API_URL=http://localhost:3000
```

### 5. Firebase Setup (Required for Notifications)
Follow [docs/firebase-setup.md](docs/firebase-setup.md) to:
1. Create Firebase project
2. Download config files
3. Place in correct locations

### 6. Run the Mobile App

**Android Emulator:**
```bash
cd mobile
npm run android
```

**iOS Simulator (Mac only):**
```bash
cd mobile
cd ios && pod install && cd ..
npm run ios
```

## Detailed Setup Guides

| Platform | Guide |
|----------|-------|
| Windows | [docs/setup/SETUP_WINDOWS.md](docs/setup/SETUP_WINDOWS.md) |
| Android | [docs/setup/SETUP_ANDROID.md](docs/setup/SETUP_ANDROID.md) |
| iOS | [docs/setup/SETUP_IOS.md](docs/setup/SETUP_IOS.md) |

## What's Built Automatically

When you run `npm run db:init`:
- SQLite database file created
- All tables created: users, parks, attractions, wait_times_cache, favorites, notification_prefs
- Default parks seeded (Magic Kingdom, Epcot, Hollywood Studios, Animal Kingdom)
- Indexes created for performance

The API poller also starts automatically, fetching wait times from Queue-Times every 60 seconds.

## What You Need to Configure

### 1. Email Service (for verification)
Required for user registration:
- SendGrid account (free tier: 100 emails/day)
- API key from SendGrid dashboard
- Verified sender email

### 2. Firebase (for notifications)
Required for push notifications:
- Firebase project
- Authentication enabled (Email/Password)
- Cloud Messaging configured

### 3. JWT Secret
For security, set a unique JWT_SECRET in production.

## Testing the Setup

### Test Backend API
```bash
# In backend directory
npm test
npm run test:api  # Quick API smoke test
```

### Test Database
Visit: `http://localhost:3000/api/parks`
Should return list of 4 Disney parks.

### Test Mobile Connection
When app launches:
1. Should show "Magic Kingdom" by default
2. List should populate with attractions
3. Wait times should display

## Common Issues

| Issue | Solution |
|-------|----------|
| `database is locked` | Close other SQLite browsers, restart server |
| `network error` on mobile | Android: use `10.0.2.2:3000` instead of `localhost` |
| Build fails on iOS | Run `cd ios && pod install` then retry |
| Can't find Firebase config | Check docs/firebase-setup.md for file locations |
| Push notifications not working | Verify Firebase setup, check device permissions |

## Repository Structure

```
dvins/
├── README.md                 # This file
├── backend/                  # REST API server
│   ├── README.md             # Backend-specific docs
│   ├── package.json
│   ├── src/
│   │   ├── database/         # SQLite schema & connection
│   │   ├── routes/           # API endpoints
│   │   ├── services/         # Business logic
│   │   ├── middleware/       # Auth & validation middleware
│   │   └── utils/            # Helpers
│   └── tests/                # Unit & integration tests
├── mobile/                   # React Native app
│   ├── package.json
│   ├── src/
│   │   ├── screens/          # UI screens
│   │   ├── navigation/       # React Navigation
│   │   └── services/         # API & Firebase
│   └── App.tsx
├── docs/                     # Documentation
│   ├── environment.md        # Environment variables
│   ├── firebase-setup.md     # Firebase configuration
│   └── ci-cd.md              # Deployment guides
└── planning/                 # Project planning documents
    ├── PRD.md                # Product Requirements Document
    ├── BRD.txt               # Business Requirements Document
    ├── architecture.md       # System architecture
    ├── design.txt            # Design specifications
    └── TASKS.md              # Development task tracking
```

## Development Workflow

1. **Start backend**: `npm run dev` in backend/
2. **Start mobile**: `npm run android` or `npm run ios` in mobile/
3. **Make changes** - Hot reload works on both
4. **Test** - `npm test` in backend/
5. **Commit** - Push when ready

## Next Steps

After setup is complete:
1. Register a test account
2. Verify your email
3. Set notification thresholds for attractions
4. Test push notifications
5. Add favorite attractions
6. Try different sort options

## Support

- Check [docs/setup/](docs/setup/) for detailed guides
- Review backend README at [backend/README.md](backend/README.md)
- Check Firebase setup: [docs/firebase-setup.md](docs/firebase-setup.md)

---

**Ready to build?** Start with the [Quick Start](#quick-start-5-minutes) section above!
