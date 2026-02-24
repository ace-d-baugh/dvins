# D'VINS - Disney Very Important Notification System

## Executive Summary

D'VINS (Disney Very Important Notification System) is a cross-platform mobile application designed to enhance the Walt Disney World guest experience by providing real-time attraction wait times, customizable sorting, and timely notifications. The app retrieves data from the Queue-Times API every 5 minutes, displaying attraction names, wait times, operational status, and trending wait times for all four Walt Disney World parks (Magic Kingdom, Epcot, Hollywood Studios, and Animal Kingdom). Users can sort attractions by park, favorites, alphabetical order, or wait times, and receive push notifications for user-defined wait time thresholds or attraction reopenings. Built with React Native and leveraging free hosting options, D'VINS aims to deliver a magical, cost-effective solution for Disney guests seeking to optimize their park experience.

## Product Overview

### Vision Statement
To create an intuitive, reliable, and magical mobile application that empowers Walt Disney World guests to make informed decisions about their park experience through real-time wait time information, personalized notifications, and seamless navigation.

### Target Users
- **Primary Users**: Walt Disney World guests aged 16-60 seeking real-time wait time information
- **Demographics**: Families, couples, solo travelers; tech-savvy or casual smartphone users
- **Usage Patterns**: Up to 120 daily active users operating from 7:00 AM ET to 11:59 PM ET, with peak usage between 9:00 AM ET and 6:00 PM ET
- **Technical Proficiency**: Ranges from casual smartphone users to tech-savvy Disney enthusiasts

### Success Metrics
- 95% uptime during peak park hours (9:00 AM–6:00 PM ET)
- Wait time data refresh within 2 seconds of API retrieval
- Notification delivery within 1 minute of condition being met
- 80% user satisfaction rate in beta testing
- Support for 120 concurrent users during peak hours
- Zero critical bugs reported in first month of production

## Functional Requirements

### Core Features

#### Real-time Wait Times Display
- **FR1**: Retrieve wait time data from Queue-Times API every 5 minutes
- **FR2**: Display for each attraction: attraction name, current wait time (minutes), status (open/closed/down), trending wait time indicators, and downtime counters
- **FR3**: Cache API data locally to display last-known wait times during network failures
- **FR4**: Handle API errors gracefully, displaying "Data unavailable" when fetch fails
- **FR5**: Include optional link to Queue-Times website for additional attraction stats

#### Park Filtering and Sorting
- **FR6**: Filter attractions by park (Magic Kingdom, Epcot, Hollywood Studios, Animal Kingdom)
- **FR7**: Sort attractions by: park, favorites, alphabetical order (A–Z), or wait time (ascending/descending)
- **FR8**: Persist sorting and filtering preferences across app sessions using local storage
- **FR9**: Allow users to mark attractions as favorites by clicking a star icon

#### Notification System
- **FR10**: Set notification preferences per attraction including wait time thresholds (0–90 minutes, 5-minute increments)
- **FR11**: Send push notifications via Firebase Cloud Messaging when conditions are met, checked every 5 minutes
- **FR12**: Support reopening alerts when attractions change from closed/down to open
- **FR13**: Provide silent or notify (sound/vibration) notification modes
- **FR14**: Request notification permissions on first launch

#### Trend Indicators and Status
- **FR15**: Display green upward-right arrow (↗) for increasing wait times
- **FR16**: Display red downward-right arrow (↘) for decreasing wait times
- **FR17**: Show downtime counters (e.g., "Down for X min") for non-operational attractions not closed for the evening

## Technical Architecture

### System Overview
```
Queue-Times API ←──(60s polling)── Backend Server (Node/Express/SQLite)
                                            ↓
Mobile Apps (React Native) ←── REST API + JWT ── FCM (notifications)
```

### Tech Stack

| Component | Technology | Purpose |
|-----------|------------|---------|
| Frontend | React Native | Cross-platform mobile app development |
| Backend | Node.js, Express | API server and business logic |
| Database | SQLite | Local data storage and caching |
| Notifications | Firebase Cloud Messaging | Push notification delivery |
| Version Control | GitHub | Code repository and collaboration |
| Process Management | PM2 | Backend process monitoring |
| Development | Visual Studio Code | Code editing and debugging |
| API Integration | Axios | HTTP client for API calls |
| Polling | Node.js Cron Job | Backend polling every 60 seconds |

### API Integration Specification

#### Queue-Times API Integration
- **Base URL**: https://queue-times.com/en-US/pages/api
- **Polling Interval**: Every 60 seconds (backend service)
- **Data Format**: JSON response containing attraction data
- **Required Fields**: attraction_name, wait_time, status, park_name, last_update
- **Optional Fields**: historical_data (for trend calculation), attraction_type

#### Backend REST API Endpoints
- **GET /api/parks**: List all available parks
- **GET /api/attractions/:parkId**: Get wait times for specific park
- **GET /api/attractions/:id**: Get single attraction details
- **POST /api/auth/register**: User registration with email verification
- **POST /api/auth/login**: User login with JWT
- **GET /api/auth/me**: Get current user info
- **PUT /api/users/preferences**: Update notification preferences
- **GET /api/favorites**: Get user's favorite attractions
- **POST /api/favorites**: Add attraction to favorites
- **DELETE /api/favorites/:id**: Remove from favorites
- **GET /api/notifications**: Get notification status

#### Typical JSON Response Structure
```json
{
  "attractions": [
    {
      "id": "space_mountain",
      "name": "Space Mountain",
      "wait_time": 45,
      "status": "Open",
      "park": "Magic Kingdom",
      "last_update": "2026-02-17T12:00:00Z",
      "historical_data": [
        {"timestamp": "2026-02-17T11:55:00Z", "wait_time": 40},
        {"timestamp": "2026-02-17T11:50:00Z", "wait_time": 38}
      ]
    }
  ]
}
```

### Polling Strategy
- **Frequency**: Every 60 seconds (backend service only)
- **First Fetch**: On backend startup
- **Background Updates**: Every 60 seconds via cron job
- **Error Handling**: Retry with exponential backoff (1s, 2s, 4s, 8s)
- **Data Validation**: Verify response structure before processing
- **External API Calls**: Reduced from 1,440/hour to 60/hour
- **Local Storage**: All mobile apps call OUR API, not Queue-Times directly

## Database Schema (SQLite)

### Users Table
```sql
CREATE TABLE Users (
    user_id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    email_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP,
    notification_preferences JSON
);
```

### Favorites Table
```sql
CREATE TABLE Favorites (
    favorite_id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    attraction_id TEXT,
    attraction_name TEXT,
    park_name TEXT,
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(user_id)
);
```

### Notification_Prefs Table
```sql
CREATE TABLE Notification_Prefs (
    pref_id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    attraction_id TEXT,
    threshold_minutes INTEGER CHECK (threshold_minutes >= 0 AND threshold_minutes <= 90),
    notification_type TEXT CHECK (notification_type IN ('silent', 'notify')),
    enabled BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(user_id)
);
```

### WaitTime_Cache Table
```sql
CREATE TABLE WaitTime_Cache (
    cache_id INTEGER PRIMARY KEY AUTOINCREMENT,
    attraction_id TEXT,
    wait_time INTEGER,
    status TEXT,
    trend TEXT CHECK (trend IN ('up', 'down', 'stable')),
    downtime_minutes INTEGER,
    fetched_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP
);
```

## User Interface

### Screen Inventory
1. **Home Screen**: Attraction list with sorting and filtering options
2. **Favorites Screen**: List of user-selected favorite attractions
3. **Settings Screen**: Notification preferences and app settings
4. **Attraction Detail Screen**: Detailed information for individual attractions
5. **Notification Setup Screen**: Configure alerts for specific attractions

### Navigation Structure
```
Bottom Tab Navigation
├── Home (Attraction List)
├── Favorites
└── Settings
```

### Key UI Components

#### Attraction List Item
- Attraction name (16px font)
- Wait time display (16px, blue color)
- Status indicator (green for open, red for closed)
- Trend arrow (↗ for increasing, ↘ for decreasing)
- Downtime counter (gray text for non-operational)
- Star icon for favorites (yellow when active)
- "More Stats" link to Queue-Times website

#### Sorting Controls
- Dropdown for park selection
- Segmented control for sort options (Park, Favorites, Alphabetical, Wait Time)
- Toggle for ascending/descending order

#### Notification Settings
- Dropdown for wait time thresholds (0–90 minutes, 5-minute increments)
- Toggle for silent/notify mode
- List of attractions with individual settings

### Color Scheme and Theming

#### Primary Colors (Disney-inspired)
- Magic Kingdom Purple: #6B5B95
- Epcot Blue: #00A1D6
- Hollywood Studios Orange: #FF6B35
- Animal Kingdom Green: #1E8449

#### Secondary Colors
- Success Green: #28A745 (open status, increasing trends)
- Danger Red: #DC3545 (closed status, decreasing trends)
- Warning Yellow: #FFC107 (favorite stars)
- Neutral Gray: #6C757D (downtime counters, secondary text)

#### Typography
- System fonts (San Francisco for iOS, Roboto for Android)
- Body text: 16px
- Headings: 20px
- Secondary text: 14px
- High contrast for accessibility (WCAG 2.1 compliance)

## Notifications System

### Firebase Cloud Messaging Setup
- **FCM Integration**: Use Firebase Admin SDK for server-side notifications
- **Device Registration**: Store FCM tokens in user preferences
- **Topic-based Messaging**: Create topics for attraction-specific notifications
- **Priority**: High for immediate notifications, normal for scheduled updates

### Threshold Logic
```javascript
function shouldSendNotification(waitTime, userThreshold, currentStatus) {
  if (currentStatus !== 'Open') return false;
  
  if (waitTime <= userThreshold) {
    return {
      send: true,
      message: `Wait time is now ${waitTime} minutes!`
    };
  }
  
  return { send: false };
}
```

### Reopening Alerts
- **Trigger**: Status change from "Closed" or "Down" to "Open"
- **Message**: "[Attraction Name] is now open!"
- **Frequency**: Once per reopening event
- **Priority**: High

### Silent vs Notify Modes
- **Silent**: Notification appears in notification center without sound/vibration
- **Notify**: Full notification with sound and vibration
- **User Control**: Per-attraction setting in notification preferences
- **Default**: Notify mode for critical thresholds (<15 minutes)

## Decisions Log

### Technical Decisions
1. **Backend Polling**: Backend polls Queue-Times API once per minute (reduced from 5 minutes)
   - **Reason**: Reduce external API calls from 1,440/hour to 60/hour
   - **Impact**: Cost reduction and rate limit compliance
   - **Implementation**: Node.js cron job with 60-second interval

2. **API Architecture**: Mobile apps call OUR API, not Queue-Times directly
   - **Reason**: Centralize data processing and caching
   - **Impact**: Single point of failure but better control
   - **Implementation**: REST API endpoints with JWT authentication

3. **Reopening Alerts**: Only send if user explicitly opts in
   - **Reason**: Prevent notification fatigue
   - **Impact**: More user control, fewer unwanted alerts
   - **Implementation**: Per-attraction notification preferences

4. **Error Handling**: Gray out listings with "no connection" messaging (Buster Bluth style)
   - **Reason**: User-friendly error states
   - **Impact**: Better UX during API failures
   - **Implementation**: Neutral gray styling with witty messaging

### Product Decisions
1. **Onboarding**: Email + password + confirm + email verification
   - **Reason**: Security and user verification
   - **Impact**: More secure but slightly longer signup
   - **Implementation**: JWT-based auth with email verification flow

2. **Default Settings**: Show only Magic Kingdom, notifications OFF
   - **Reason**: Focus on most popular park, avoid notification fatigue
   - **Impact**: Better first-time user experience
   - **Implementation**: Default park filter and notification preferences

3. **Beta Testing**: 2 weeks solo testing, then max 5 testers
   - **Reason**: Controlled testing before wider release
   - **Impact**: More thorough testing with limited scope
   - **Implementation**: TestFlight deployment with limited testers

### Business Decisions
1. **Cost-First Approach**: Documented as priority
   - **Reason**: Limited budget, need to minimize costs
   - **Impact**: Shared hosting, free services where possible
   - **Implementation**: Use free tiers, minimize API calls

2. **No Immediate Scaling**: Focus on core functionality first
   - **Reason**: Validate product before investing in scaling
   - **Impact**: Simpler architecture, easier to maintain
   - **Implementation**: Single backend server, SQLite database

## Development Phases

### Sprint 1: Core Foundation (Week 1-2)
**Objectives**: Establish basic app structure and API integration
- Set up React Native project with navigation
- Create basic attraction list component
- Implement Queue-Times API integration
- Set up SQLite database schema
- Create basic backend server with Express
- Configure Firebase Cloud Messaging

**Deliverables**:
- Working app with attraction list display
- API integration with 5-minute polling
- Basic SQLite database setup
- Firebase notification infrastructure

### Sprint 2: Features (Week 3-4)
**Objectives**: Implement sorting, filtering, and favorites system
- Add park filtering functionality
- Implement sorting options (park, favorites, alphabetical, wait time)
- Create favorites system with star icons
- Add trend indicators and downtime counters
- Implement local storage for preferences
- Add "More Stats" link to Queue-Times website

**Deliverables**:
- Complete sorting and filtering system
- Working favorites functionality
- Trend indicators and status displays
- Persistent user preferences

### Sprint 3: Notifications (Week 5-6)
**Objectives**: Implement comprehensive notification system
- Create notification settings screen
- Implement threshold-based notifications
- Add reopening alerts
- Set up Firebase Cloud Messaging integration
- Implement notification permission handling
- Add silent/notify mode functionality

**Deliverables**:
- Complete notification settings interface
- Working push notifications
- Reopening alerts system
- Notification permission flow

### Sprint 4: Polish (Week 7-8)
**Objectives**: Refine UI/UX and prepare for deployment
- Implement PWA support (optional)
- Add offline support with cached data
- Comprehensive testing and bug fixes
- Performance optimization
- Prepare for beta testing (TestFlight, Google Play)
- Documentation and deployment preparation

**Deliverables**:
- Production-ready application
- Comprehensive test coverage
- Beta testing deployment
- User documentation

## Out of Scope (v1)

### Features Not Included in Initial Release
- Support for other Disney resorts (Disneyland, Tokyo Disney, etc.)
- Monetization features (ads, in-app purchases)
- Advanced features (attraction maps, park hours, geolocation-based sorting)
- Paid hosting or premium services
- Advanced analytics or user tracking
- Social features (sharing, friend lists)
- Multi-language support
- Advanced customization options

### Technical Limitations
- No support for devices below iOS 16 or Android 11
- No support for web browsers (PWA optional)
- No offline data modification (read-only offline mode)
- No cross-device synchronization (local storage only)

## Open Questions

### Technical Questions
1. **Queue-Times API Rate Limits**: What are the specific rate limits and authentication requirements for the Queue-Times API?
2. **Notification Behavior**: Should reopening alerts apply to all attractions or only favorites?
3. **Sorting Options**: Are additional sorting options (e.g., attraction type, proximity) required?
4. **Server Specifications**: What are the exact specifications of the shared Linux server (CPU, RAM, storage, bandwidth)?
5. **API Response Format**: Confirm the exact JSON structure and field names returned by Queue-Times API.

### Product Questions
1. **User Onboarding**: What is the optimal user onboarding experience for first-time users?
2. **Default Settings**: What should be the default notification thresholds and sorting preferences?
3. **Error Handling**: How should the app handle prolonged API downtime or data inconsistencies?
4. **Performance Targets**: What are the acceptable performance metrics for different device categories?
5. **Beta Testing Scope**: Should beta testing include specific user demographics or usage patterns?

### Business Questions
1. **Distribution Strategy**: Should we pursue PWA deployment to avoid app store fees?
2. **User Acquisition**: What channels will be used to acquire the initial 120 daily active users?
3. **Feedback Collection**: How will user feedback be collected and prioritized for future releases?
4. **Legal Considerations**: Are there any Disney-specific terms of service or branding guidelines to consider?
5. **Scalability Planning**: What is the timeline for migrating from shared hosting to more robust infrastructure?

---

*This PRD serves as the definitive guide for developing D'VINS. All stakeholders should review and approve this document before development proceeds.*