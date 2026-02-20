# D'VINS Backend API

A Node.js backend API service for tracking Disney World wait times with user authentication, favorites, and email verification.

## Features

- **Real-time Wait Times**: Polls Queue-Times API every 60 seconds
- **User Authentication**: JWT-based auth with email verification
- **Favorites System**: Users can save favorite attractions
- **RESTful API**: Clean, documented endpoints
- **Email Service**: Verification and notification emails
- **SQLite Database**: Lightweight, file-based storage

## Tech Stack

- **Node.js** 18+
- **Express.js** for API routing
- **SQLite3** for database
- **JWT** for authentication
- **bcrypt** for password hashing
- **nodemailer** for email service
- **node-cron** for scheduling
- **express-validator** for input validation

## API Endpoints

### Authentication
- `POST /auth/register` - Create new user account
- `POST /auth/login` - Authenticate user
- `POST /auth/verify-email` - Verify email address

### Parks
- `GET /parks` - List all parks
- `GET /parks/:parkId/attractions` - Get attractions for a park

### Attractions
- `GET /attractions/:attractionId` - Get attraction details

### Favorites
- `POST /favorites` - Add attraction to favorites
- `GET /favorites` - List user's favorites
- `DELETE /favorites/:id` - Remove from favorites

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy environment variables:
   ```bash
   cp .env.example .env
   ```
4. Configure your environment variables (see `.env.example`)
5. Initialize the database:
   ```bash
   npm run db:init
   ```
6. Seed the database with parks:
   ```bash
   npm run db:seed
   ```

## Configuration

Edit the `.env` file with your settings:

```env
NODE_ENV=development
PORT=3000

# Database
DB_PATH=./data/dvins.db

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d

# Email (SendGrid SMTP)
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=your-sendgrid-api-key
EMAIL_FROM=verify@dvins.app

# App
APP_URL=http://localhost:3000

# Queue-Times API
QUEUE_TIMES_API_URL=https://queue-times.com/parks.json
```

## Usage

### Development
```bash
npm run dev
```

### Production
```bash
npm start
```

### Running Poller Only
```bash
npm run poller
```

### Database Management
```bash
# Initialize database
npm run db:init

# Seed database with parks
npm run db:seed
```

## Testing

Run all tests:
```bash
npm test
```

Run unit tests only:
```bash
npm run test:unit
```

Run integration tests only:
```bash
npm run test:integration
```

## API Documentation

### Authentication

#### Register
```http
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "Password123!",
  "password_confirmation": "Password123!"
}
```

Response:
```json
{
  "message": "Registration successful. Please check your email for verification link.",
  "user": {
    "id": 1,
    "email": "user@example.com"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "Password123!"
}
```

Response:
```json
{
  "message": "Login successful",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "email_verified": 1
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Verify Email
```http
POST /auth/verify-email
Content-Type: application/json

{
  "token": "verification-token-here"
}
```

### Parks

#### Get All Parks
```http
GET /parks
```

Response:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Magic Kingdom Park",
      "abbreviation": "MK",
      "external_api_id": 1
    }
  ],
  "count": 4
}
```

#### Get Park Attractions
```http
GET /parks/1/attractions
```

Response:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Space Mountain",
      "external_api_id": 123,
      "wait_minutes": 45,
      "status": "Operating",
      "trend": "up",
      "fetched_at": "2024-01-01T12:00:00.000Z"
    }
  ],
  "count": 25
}
```

### Attractions

#### Get Attraction Details
```http
GET /attractions/1
```

Response:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Space Mountain",
    "external_api_id": 123,
    "park_name": "Magic Kingdom Park",
    "park_abbreviation": "MK",
    "wait_minutes": 45,
    "status": "Operating",
    "trend": "up",
    "fetched_at": "2024-01-01T12:00:00.000Z"
  }
}
```

### Favorites

#### Add to Favorites
```http
POST /favorites
Authorization: Bearer <token>
Content-Type: application/json

{
  "attraction_id": 1
}
```

Response:
```json
{
  "success": true,
  "message": "Attraction added to favorites",
  "data": {
    "user_id": 1,
    "attraction_id": 1
  }
}
```

#### List Favorites
```http
GET /favorites
Authorization: Bearer <token>
```

Response:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "attraction_id": 1,
      "attraction_name": "Space Mountain",
      "park_name": "Magic Kingdom Park",
      "park_abbreviation": "MK",
      "wait_minutes": 45,
      "status": "Operating",
      "trend": "up",
      "fetched_at": "2024-01-01T12:00:00.000Z"
    }
  ],
  "count": 5
}
```

#### Remove from Favorites
```http
DELETE /favorites/1
Authorization: Bearer <token>
```

Response:
```json
{
  "success": true,
  "message": "Attraction removed from favorites"
}
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `development` |
| `PORT` | Server port | `3000` |
| `DB_PATH` | SQLite database path | `./data/dvins.db` |
| `JWT_SECRET` | JWT secret key | (required) |
| `JWT_EXPIRES_IN` | JWT expiration time | `7d` |
| `SMTP_HOST` | Email SMTP host | `smtp.sendgrid.net` |
| `SMTP_PORT` | Email SMTP port | `587` |
| `SMTP_USER` | Email SMTP username | `apikey` |
| `SMTP_PASS` | Email SMTP password | (required) |
| `EMAIL_FROM` | Email from address | `verify@dvins.app` |
| `APP_URL` | Application URL | `http://localhost:3000` |

## Error Handling

The API returns appropriate HTTP status codes:

- `200 OK` - Successful request
- `201 Created` - Resource created successfully
- `400 Bad Request` - Invalid request data
- `401 Unauthorized` - Authentication required
- `403 Forbidden` - Authorization denied
- `404 Not Found` - Resource not found
- `409 Conflict` - Resource conflict
- `500 Internal Server Error` - Server error

## Security

- **JWT Authentication**: All protected routes require valid JWT tokens
- **Password Hashing**: Passwords are hashed with bcrypt (12 rounds)
- **Input Validation**: All inputs are validated using express-validator
- **SQL Injection Prevention**: Parameterized queries are used
- **CORS Protection**: CORS is configured for security
- **Helmet**: Security headers are set

## Deployment

1. Set up your environment variables
2. Ensure Node.js 18+ is installed
3. Install dependencies: `npm install --production`
4. Initialize and seed database
5. Start the application: `npm start`

## License

MIT License

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## Support

For issues and questions, please create an issue in the repository.
