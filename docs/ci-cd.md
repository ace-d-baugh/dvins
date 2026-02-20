# GitHub Actions Workflows

## CI/CD Pipeline Configuration

### Test Workflow

Create `.github/workflows/test.yml`:

```yaml
name: Test

on:
  push:
    branches: [ main, develop, staging ]
  pull_request:
    branches: [ main ]

jobs:
  test-backend:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node-version: [18.x, 20.x]
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Use Node.js ${{ matrix.node-version }}
      uses: actions/setup-node@v4
      with:
        node-version: ${{ matrix.node-version }}
        cache: 'npm'
    
    - name: Install dependencies
      run: |
        cd backend
        npm ci
    
    - name: Run tests
      run: |
        cd backend
        npm run test:ci
    
    - name: Upload coverage
      uses: codecov/codecov-action@v3
      with:
        file: ./backend/coverage/lcov.info
        flags: backend
        name: backend-coverage

  test-mobile:
    runs-on: macos-latest
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Install dependencies
      run: |
        cd mobile
        npm ci
    
    - name: Run tests
      run: |
        cd mobile
        npm run test:ci
    
    - name: Upload coverage
      uses: codecov/codecov-action@v3
      with:
        file: ./mobile/coverage/lcov.info
        flags: mobile
        name: mobile-coverage
```

### Build Workflow

Create `.github/workflows/build.yml`:

```yaml
name: Build

on:
  push:
    branches: [ main, develop, staging ]
  pull_request:
    branches: [ main ]

jobs:
  build-backend:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Use Node.js 18.x
      uses: actions/setup-node@v4
      with:
        node-version: 18.x
        cache: 'npm'
    
    - name: Install dependencies
      run: |
        cd backend
        npm ci
    
    - name: Build backend
      run: |
        cd backend
        npm run build
    
    - name: Upload build artifact
      uses: actions/upload-artifact@v4
      with:
        name: backend-build
        path: backend/dist/
        retention-days: 7

  build-mobile:
    runs-on: macos-latest
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Install dependencies
      run: |
        cd mobile
        npm ci
    
    - name: Build Android
      run: |
        cd mobile
        npm run build:android
    
    - name: Build iOS
      run: |
        cd mobile
        npm run build:ios
    
    - name: Upload Android artifact
      uses: actions/upload-artifact@v4
      with:
        name: android-build
        path: mobile/android/app/build/outputs/
        retention-days: 7
    
    - name: Upload iOS artifact
      uses: actions/upload-artifact@v4
      with:
        name: ios-build
        path: mobile/ios/build/
        retention-days: 7
```

### Deploy Workflow

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [ main, staging ]

env:
  FIREBASE_TOKEN: ${{ secrets.FIREBASE_TOKEN }}
  APPLE_ID: ${{ secrets.APPLE_ID }}
  APPLE_ID_PASSWORD: ${{ secrets.APPLE_ID_PASSWORD }}
  GOOGLE_SERVICE_ACCOUNT: ${{ secrets.GOOGLE_SERVICE_ACCOUNT }}

jobs:
  deploy-backend:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Use Node.js 18.x
      uses: actions/setup-node@v4
      with:
        node-version: 18.x
        cache: 'npm'
    
    - name: Install dependencies
      run: |
        cd backend
        npm ci
    
    - name: Build backend
      run: |
        cd backend
        npm run build
    
    - name: Deploy to Firebase
      run: |
        cd backend
        npm install -g firebase-tools
        firebase deploy --token ${{ secrets.FIREBASE_TOKEN }} --only functions,hosting
    
    - name: Notify deployment
      uses: appleboy/telegram-action@v1.0.0
      with:
        to: ${{ secrets.TELEGRAM_CHAT_ID }}
        token: ${{ secrets.TELEGRAM_BOT_TOKEN }}
        message: Backend deployed successfully to ${{ github.ref_name }}

  deploy-mobile:
    runs-on: macos-latest
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Install dependencies
      run: |
        cd mobile
        npm ci
    
    - name: Build Android
      run: |
        cd mobile
        npm run build:android
    
    - name: Upload to Google Play
      uses: r0adkll/upload-google-play@v1
      with:
        serviceAccountJsonPlainText: ${{ secrets.GOOGLE_SERVICE_ACCOUNT }}
        packageName: com.dvins.app
        releaseFiles: mobile/android/app/build/outputs/bundle/productionRelease/**/*.aab
        track: internal
        status: completed
    
    - name: Build iOS
      run: |
        cd mobile
        npm run build:ios
    
    - name: Upload to TestFlight
      uses: maierj/upload-to-app-store-action@v1.0.2
      with:
        api_key_id: ${{ secrets.APP_STORE_CONNECT_API_KEY_ID }}
        api_key_issuer_id: ${{ secrets.APP_STORE_CONNECT_API_KEY_ISSUER_ID }}
        api_key: ${{ secrets.APP_STORE_CONNECT_API_KEY }}
        app_id: ${{ secrets.APP_STORE_APP_ID }}
        build_path: mobile/ios/build/Products/Release-iphoneos/
        beta_external: false
    
    - name: Notify deployment
      uses: appleboy/telegram-action@v1.0.0
      with:
        to: ${{ secrets.TELEGRAM_CHAT_ID }}
        token: ${{ secrets.TELEGRAM_BOT_TOKEN }}
        message: Mobile apps deployed successfully to ${{ github.ref_name }}
```

### Staging Workflow

Create `.github/workflows/staging.yml`:

```yaml
name: Staging

on:
  push:
    branches: [ develop ]

env:
  FIREBASE_TOKEN: ${{ secrets.FIREBASE_TOKEN }}
  APPLE_ID: ${{ secrets.APPLE_ID }}
  APPLE_ID_PASSWORD: ${{ secrets.APPLE_ID_PASSWORD }}
  GOOGLE_SERVICE_ACCOUNT: ${{ secrets.GOOGLE_SERVICE_ACCOUNT }}

jobs:
  deploy-staging:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Use Node.js 18.x
      uses: actions/setup-node@v4
      with:
        node-version: 18.x
        cache: 'npm'
    
    - name: Install dependencies
      run: |
        cd backend
        npm ci
    
    - name: Build backend
      run: |
        cd backend
        npm run build
    
    - name: Deploy to Firebase Staging
      run: |
        cd backend
        npm install -g firebase-tools
        firebase use staging --token ${{ secrets.FIREBASE_TOKEN }}
        firebase deploy --token ${{ secrets.FIREBASE_TOKEN }} --only functions,hosting
    
    - name: Build mobile for staging
      run: |
        cd mobile
        npm ci
        npm run build:android:staging
        npm run build:ios:staging
    
    - name: Notify staging deployment
      uses: appleboy/telegram-action@v1.0.0
      with:
        to: ${{ secrets.TELEGRAM_CHAT_ID }}
        token: ${{ secrets.TELEGRAM_BOT_TOKEN }}
        message: Staging environment deployed successfully
```

## Required Secrets

Add these secrets to your GitHub repository:

### Firebase
- `FIREBASE_TOKEN`: Firebase CI token
- `FIREBASE_PROJECT_ID`: Firebase project ID

### Apple Developer
- `APPLE_ID`: Apple ID email
- `APPLE_ID_PASSWORD`: App-specific password
- `APP_STORE_CONNECT_API_KEY_ID`: API key ID
- `APP_STORE_CONNECT_API_KEY_ISSUER_ID`: Issuer ID
- `APP_STORE_CONNECT_API_KEY`: API key (base64 encoded)
- `APP_STORE_APP_ID`: App Store Connect App ID

### Google Play
- `GOOGLE_SERVICE_ACCOUNT`: Google Play service account JSON

### Notifications
- `TELEGRAM_CHAT_ID`: Telegram chat ID for notifications
- `TELEGRAM_BOT_TOKEN`: Telegram bot token

## Environment Variables

### Backend Environment Variables
- `NODE_ENV`: Environment (production/staging/development)
- `PORT`: Server port
- `DATABASE_URL`: Database connection string
- `JWT_SECRET`: JWT secret key

### Mobile Environment Variables
- `API_URL`: Backend API URL
- `FIREBASE_CONFIG`: Firebase configuration

## Deployment Scripts

### Production Deployment Script

Create `scripts/deploy/prod.sh`:

```bash
#!/bin/bash

# Production Deployment Script

echo "Starting production deployment..."

# Check if we're on main branch
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "main" ]; then
    echo "Error: Can only deploy from main branch"
    exit 1
fi

# Pull latest changes
echo "Pulling latest changes..."
git pull origin main

# Build backend
echo "Building backend..."
cd backend
npm ci
npm run build

# Deploy backend to Firebase
echo "Deploying backend to Firebase..."
npm install -g firebase-tools
firebase deploy --only functions,hosting

# Build mobile apps
echo "Building mobile apps..."
cd ../mobile
npm ci
npm run build:android
npm run build:ios

# Upload to app stores
echo "Uploading to app stores..."
# Google Play upload (using fastlane or similar)
# TestFlight upload (using fastlane or similar)

# Notify success
echo "Deployment complete!"
```

### Staging Deployment Script

Create `scripts/deploy/staging.sh`:

```bash
#!/bin/bash

# Staging Deployment Script

echo "Starting staging deployment..."

# Check if we're on develop branch
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "develop" ]; then
    echo "Error: Can only deploy from develop branch"
    exit 1
fi

# Pull latest changes
echo "Pulling latest changes..."
git pull origin develop

# Build backend
echo "Building backend..."
cd backend
npm ci
npm run build

# Deploy backend to Firebase staging
echo "Deploying backend to Firebase staging..."
npm install -g firebase-tools
firebase use staging
firebase deploy --only functions,hosting

# Build mobile apps for staging
echo "Building mobile apps for staging..."
cd ../mobile
npm ci
npm run build:android:staging
npm run build:ios:staging

# Notify success
echo "Staging deployment complete!"
```

## Manual Deployment Steps

1. **Prepare environment**: Set up all required environment variables
2. **Build artifacts**: Run build scripts for backend and mobile
3. **Test locally**: Verify builds work correctly
4. **Deploy backend**: Deploy to Firebase or preferred hosting
5. **Deploy mobile**: Upload to app stores
6. **Verify deployment**: Check all services are running
7. **Notify team**: Send deployment notifications

## Rollback Procedures

1. **Backend rollback**: Use Firebase rollback or redeploy previous version
2. **Mobile rollback**: Use app store's rollback feature or submit previous version
3. **Database rollback**: Use Firestore's backup and restore features
4. **Monitor**: Check logs and monitoring after rollback

## Monitoring

- **Health checks**: Set up health check endpoints
- **Error tracking**: Integrate with error tracking services
- **Performance monitoring**: Set up performance monitoring
- **Logging**: Centralized logging setup

## Security Considerations

1. **Secrets management**: Use GitHub secrets for sensitive data
2. **Access control**: Limit who can trigger deployments
3. **Audit logging**: Track all deployment activities
4. **SSL certificates**: Ensure HTTPS for all endpoints
5. **API rate limiting**: Implement rate limiting for APIs

## Next Steps

1. Set up Firebase project and configure apps
2. Create environment variable files
3. Set up GitHub secrets
4. Test CI/CD pipeline
5. Deploy to staging
6. Deploy to production

## Troubleshooting

See [docs/deployment.md](docs/deployment.md) for common issues and solutions.
