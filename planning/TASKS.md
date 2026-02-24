# D'VINS Development Tasks

## Sprint 1: Backend Foundation (Week 1-2)
**Objectives**: Establish basic app structure and API integration

- [ ] Set up GitHub repo for dvins-backend
- [ ] Create Express server with SQLite setup
- [ ] Create database schema (users, favorites, notifications, wait_times_cache)
- [ ] Build Queue-Times API poller (runs every 60 seconds)
- [ ] Create REST API endpoints:
  - GET /api/parks (list parks)
  - GET /api/attractions/:parkId (wait times for park)
  - GET /api/attractions/:id (single attraction)
- [ ] Implement JWT auth (register, login, email verification)

## Sprint 2: Mobile App Foundation (Week 3-4)
**Objectives**: Implement sorting, filtering, and favorites system

- [ ] Set up React Native project
- [ ] Build navigation (Home, Favorites, Settings)
- [ ] Create attraction list UI with park filtering
- [ ] Implement favorites system with star toggle
- [ ] Connect to backend API
- [ ] Implement sorting (park, favorites, alphabetical, wait time)

## Sprint 3: Notifications (Week 5-6)
**Objectives**: Implement comprehensive notification system

- [ ] Backend: Build notification evaluation engine
- [ ] Backend: Integrate Firebase Cloud Messaging
- [ ] Mobile: Add notification settings screen
- [ ] Mobile: Request notification permissions
- [ ] Mobile: Handle FCM token registration
- [ ] Implement threshold-based notifications

## Sprint 4: Polish & Beta (Week 7-8)
**Objectives**: Refine UI/UX and prepare for deployment

- [ ] Build user registration/login UI
- [ ] Add "no connection" error states
- [ ] Implement dark mode
- [ ] TestFlight deployment
- [ ] Solo testing (2 weeks)
- [ ] Beta testing (5 users)