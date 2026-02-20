# Environment Configuration

## Backend Environment Variables

Create `.env` in backend directory with these variables:

```bash
# Server Configuration
PORT=3000
NODE_ENV=development

# Database (SQLite)
DATABASE_URL=./data/dvins.db

# Authentication
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# Email Service (Optional)
EMAIL_SERVICE=sendgrid
sendgrid_api_key=your_sendgrid_api_key
from_email=noreply@dvins.app

# Firebase
FIREBASE_PROJECT_ID=dvins-app
FIREBASE_PRIVATE_KEY=your_firebase_private_key
FIREBASE_CLIENT_EMAIL=your_firebase_client_email

# API Configuration
API_URL=http://localhost:3000
PUBLIC_URL=http://localhost:3000

# CORS
CORS_ORIGIN=http://localhost:19006,http://localhost:3000
```

## Mobile Environment Variables

Create `.env` in mobile directory with these variables:

```bash
# API Configuration
API_URL=https://api.dvins.app

# Firebase Configuration
FIREBASE_API_KEY=your_firebase_api_key
FIREBASE_AUTH_DOMAIN=dvins-app.firebaseapp.com
FIREBASE_PROJECT_ID=dvins-app
FIREBASE_STORAGE_BUCKET=dvins-app.appspot.com
FIREBASE_MESSAGING_SENDER_ID=your_sender_id
FIREBASE_APP_ID=your_app_id

# Default Park (for development)
DEFAULT_PARK_ID=default-park-id

# App Configuration
APP_ENVIRONMENT=development
APP_VERSION=1.0.0
```

## Environment Variable Guide

### Server Configuration
- `PORT`: Server port (default: 3000)
- `NODE_ENV`: Environment (development/production/staging)

### Database
- `DATABASE_URL`: SQLite database file path (e.g., `./data/dvins.db`)

### Authentication
- `JWT_SECRET`: Secret for JWT token signing
- `JWT_EXPIRES_IN`: JWT token expiration time

### Email Service
- `EMAIL_SERVICE`: Email provider (sendgrid/mailgun/nodemailer)
- `sendgrid_api_key`: SendGrid API key (if using SendGrid)
- `from_email`: Default from email address

### Firebase
- `FIREBASE_PROJECT_ID`: Firebase project ID
- `FIREBASE_PRIVATE_KEY`: Firebase service account private key
- `FIREBASE_CLIENT_EMAIL`: Firebase service account client email

### API Configuration
- `API_URL`: Backend API URL
- `PUBLIC_URL`: Public URL for frontend

### CORS
- `CORS_ORIGIN`: Comma-separated list of allowed origins

## Setup Scripts

### Backend Setup Script

Create `backend/scripts/setup.sh`:

```bash
#!/bin/bash

# Backend Environment Setup Script

echo "Setting up backend environment..."

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    cp .env.example .env
    echo "Created .env from .env.example"
fi

# Install dependencies
npm install

# Setup database (if needed)
echo "Database setup complete"

echo "Backend setup complete!"
echo "Start with: npm run dev"
```

### Mobile Setup Script

Create `mobile/scripts/setup.sh`:

```bash
#!/bin/bash

# Mobile Environment Setup Script

echo "Setting up mobile environment..."

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    cp .env.example .env
    echo "Created .env from .env.example"
fi

# Install dependencies
npm install

# Install pods (if using React Native)
echo "Installing pods..."
npm run ios:pods

# Setup Firebase config
if [ ! -d config ]; then
    mkdir config
fi

# Copy Firebase config files if they exist
if [ -f ../config/firebase/ios/GoogleService-Info.plist ]; then
    cp ../config/firebase/ios/GoogleService-Info.plist config/
    echo "Copied Firebase iOS config"
fi

if [ -f ../config/firebase/android/google-services.json ]; then
    cp ../config/firebase/android/google-services.json android/app/
    echo "Copied Firebase Android config"
fi

echo "Mobile setup complete!"
echo "Start with: npm run ios or npm run android"
```

## Security Notes

1. **Never commit .env files** - Add to .gitignore
2. **Use different secrets for each environment** - development, staging, production
3. **Rotate secrets regularly** - especially JWT_SECRET and API keys
4. **Use environment-specific configurations** - don't use production keys in development
5. **Store sensitive data securely** - use secret management services in production

## Development Workflow

1. Copy `.env.example` to `.env`
2. Fill in required values
3. Run setup script: `./scripts/setup.sh`
4. Start development server
5. Test with appropriate environment variables

## Production Setup

For production, use environment variables directly or a secret management service:

```bash
# Set environment variables
export PORT=3000
export DATABASE_URL=mongodb://prod-db:27017/dvins
export JWT_SECRET=production-secret-key

# Or use a .env file with production values
npm start
```

## Common Issues

### Database Connection Issues
- Check DATABASE_URL format
- Ensure MongoDB is running
- Check network connectivity

### Firebase Configuration Issues
- Verify Firebase config files are in correct locations
- Check Firebase project settings
- Ensure correct API keys and IDs

### JWT Issues
- Verify JWT_SECRET matches between services
- Check token expiration settings
- Ensure proper token validation

## Next Steps

1. Set up Firebase project (see firebase-setup.md)
2. Configure environment variables
3. Run setup scripts
4. Start development servers
5. Test integration

## Documentation
See [docs/environment.md](docs/environment.md) for detailed environment variable documentation.
