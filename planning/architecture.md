# D'VINS Technical Architecture

## System Overview
```
Queue-Times API ←──(60s polling)── Backend Server (Node/Express/SQLite)
                                            ↓
Mobile Apps (React Native) ←── REST API + JWT ── FCM (notifications)
```

## Architecture Components

### Backend Service
- **Technology**: Node.js + Express
- **Database**: SQLite
- **Polling**: Cron job every 60 seconds
- **API**: REST endpoints with JWT authentication
- **Notifications**: Firebase Cloud Messaging integration

### Mobile Apps
- **Technology**: React Native
- **API Communication**: HTTP requests to backend
- **Notifications**: FCM for push notifications
- **Authentication**: JWT tokens
- **Storage**: AsyncStorage for local preferences

### Data Flow
1. Backend polls Queue-Times API every 60 seconds
2. Data stored in SQLite with timestamp
3. Mobile apps call OUR API endpoints
4. Backend evaluates notification conditions
5. FCM sends notifications to mobile devices

## Key Design Decisions

### Polling Strategy
- **Frequency**: 60 seconds (reduced from 5 minutes)
- **Purpose**: Reduce external API calls from 1,440/hour to 60/hour
- **Benefit**: Cost reduction and rate limit compliance

### API Architecture
- **Mobile → Our API → Queue-Times**: All mobile traffic goes through our backend
- **Security**: JWT authentication for all endpoints
- **Caching**: SQLite cache with timestamp validation

### Notification System
- **Backend Evaluation**: All threshold logic handled by backend
- **Reopening Alerts**: Only for explicitly opted-in attractions
- **User Control**: Per-attraction notification preferences

## Database Schema

### Core Tables
- **Users**: User accounts with email verification
- **Favorites**: User-selected favorite attractions
- **Notification_Prefs**: Per-attraction notification settings
- **WaitTime_Cache**: Cached wait time data with timestamps

### Relationships
- Users → Favorites (one-to-many)
- Users → Notification_Prefs (one-to-many)
- WaitTime_Cache (standalone cache table)

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration with email verification
- `POST /api/auth/login` - User login with JWT
- `GET /api/auth/me` - Get current user info

### Parks & Attractions
- `GET /api/parks` - List all available parks
- `GET /api/attractions/:parkId` - Get wait times for specific park
- `GET /api/attractions/:id` - Get single attraction details

### User Preferences
- `GET /api/favorites` - Get user's favorite attractions
- `POST /api/favorites` - Add attraction to favorites
- `DELETE /api/favorites/:id` - Remove from favorites
- `PUT /api/users/preferences` - Update notification preferences
- `GET /api/notifications` - Get notification status

## Technology Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: SQLite
- **Auth**: JWT (jsonwebtoken)
- **HTTP Client**: Axios
- **Polling**: node-cron
- **Process Management**: PM2

### Mobile
- **Framework**: React Native
- **Navigation**: React Navigation
- **HTTP Client**: Axios
- **Notifications**: Firebase Cloud Messaging
- **Storage**: AsyncStorage
- **Icons**: React Native Vector Icons

### Infrastructure
- **Version Control**: GitHub
- **Hosting**: Shared Linux server (TBD)
- **CI/CD**: GitHub Actions
- **Monitoring**: PM2 logs and health checks