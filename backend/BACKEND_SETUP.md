# GiveWay Backend Setup Guide

## Overview

The GiveWay backend is a Node.js/Express API server that connects to a PostgreSQL database via Prisma ORM.

## Quick Start

### Option 1: Using Docker Compose (Recommended)

```bash
# Start both PostgreSQL and backend
docker-compose -f docker-compose.backend.yml up

# In another terminal, run migrations and seed
cd backend
npm run migrate:dev
npm run seed
```

### Option 2: Local Setup

#### Prerequisites
- Node.js 18+
- PostgreSQL 12+ running locally

#### 1. Install Dependencies
```bash
cd backend
npm install
```

#### 2. Set Environment Variables
```bash
# Copy the example env file
cp .env.example .env.local

# Update DATABASE_URL if needed
# Default: postgresql://giveway:giveway_pass@localhost:5432/giveway
```

#### 3. Set Up PostgreSQL

**On Windows:**
```bash
# Download PostgreSQL installer from https://www.postgresql.org/download/windows/
# Or use WSL2 with Docker
docker run -d \
  -e POSTGRES_USER=giveway \
  -e POSTGRES_PASSWORD=giveway_pass \
  -e POSTGRES_DB=giveway \
  -p 5432:5432 \
  postgres:15-alpine
```

**On Mac:**
```bash
brew install postgresql@15
brew services start postgresql@15
```

**On Linux:**
```bash
sudo apt-get install postgresql-15
sudo systemctl start postgresql
```

#### 4. Run Migrations
```bash
npm run migrate:dev
```

#### 5. Seed Database (Optional)
```bash
npm run seed
```

#### 6. Start Backend Server
```bash
npm run dev
```

Server will be available at `http://localhost:4000`

## Project Structure

```
backend/
├── src/
│   ├── index.ts                 # Express app entry point
│   ├── middleware/
│   │   ├── auth.ts             # JWT authentication
│   │   └── errorHandler.ts     # Error handling
│   ├── routes/
│   │   ├── auth.ts             # Authentication endpoints
│   │   ├── users.ts            # User endpoints
│   │   ├── ngos.ts             # NGO endpoints
│   │   ├── donations.ts        # Donation endpoints
│   │   ├── volunteers.ts       # Volunteer endpoints
│   │   ├── notifications.ts    # Notification endpoints
│   │   └── feed.ts             # Feed endpoints
│   ├── services/
│   │   ├── authService.ts      # Authentication logic
│   │   ├── userService.ts      # User logic
│   │   ├── ngoService.ts       # NGO logic
│   │   ├── donationService.ts  # Donation logic
│   │   ├── volunteerService.ts # Volunteer logic
│   │   └── notificationService.ts
│   └── utils/                  # Utility functions
├── prisma/
│   ├── schema.prisma           # Database schema
│   └── seed.ts                 # Database seeding
├── package.json
├── tsconfig.json
├── Dockerfile                  # Docker configuration
└── .env.example               # Environment template
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user

### Users
- `GET /api/users/:id` - Get user profile
- `PATCH /api/users/:id` - Update user
- `POST /api/users/:userId/follow/:ngoId` - Follow NGO
- `POST /api/users/:userId/unfollow/:ngoId` - Unfollow NGO

### NGOs
- `GET /api/ngos` - List all NGOs
- `GET /api/ngos/:id` - Get NGO details
- `POST /api/ngos` - Create NGO
- `PATCH /api/ngos/:id` - Update NGO
- `DELETE /api/ngos/:id` - Delete NGO

### Donations
- `GET /api/donations` - List donations
- `POST /api/donations` - Create donation

### Volunteers
- `GET /api/volunteers` - List volunteer requests
- `POST /api/volunteers/:ngoId` - Create volunteer request
- `PATCH /api/volunteers/:id/status` - Update volunteer request status

### Notifications
- `GET /api/notifications/:userId` - Get notifications
- `PATCH /api/notifications/:id/read` - Mark as read
- `PATCH /api/notifications/all/read` - Mark all as read

### Feed
- `GET /api/feed/my` - Get user feed

## Database

### Schema Overview

**Users** - Application users
- Roles: user, ngo_admin, admin, superadmin
- Authentication via JWT tokens

**NGOs** - Non-profit organizations
- Verified status
- Multiple members with different roles

**Donations** - Donation records
- Links users to NGOs
- Amount and message tracking

**Volunteer Requests** - Volunteer applications
- Status: pending, accepted, rejected
- Skills and hours tracking

**Notifications** - User notifications
- Multiple notification types
- Read/unread status

## Common Commands

```bash
# Development
npm run dev              # Start dev server with hot reload
npm run build           # Build TypeScript to JavaScript
npm start               # Run production build

# Database
npm run migrate:dev     # Create migration and apply
npm run migrate         # Apply existing migrations
npm run migrate:reset   # Reset database (caution!)
npm run seed            # Seed database with test data
npm run prisma:studio   # Open Prisma Studio UI
npm run prisma:generate # Generate Prisma client

# Code Quality
npm run lint            # Run ESLint
npm run typecheck       # Run TypeScript check

# Testing
npm test               # Run tests
```

## Environment Variables

### Required
```
DATABASE_URL          - PostgreSQL connection string
JWT_SECRET           - Secret key for JWT tokens
PORT                 - Server port (default: 4000)
NODE_ENV             - Environment (development/production)
```

### Optional
```
CORS_ORIGIN          - Allowed origins for CORS
JWT_EXPIRES_IN       - Token expiration time
```

## Authentication

### Login
```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@giveway.org","password":"password123"}'
```

### Using Token
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:4000/api/auth/me
```

## Test Credentials

After seeding the database:

```
Email: superadmin@giveway.org
Password: password123
Role: superadmin

Email: admin@giveway.org
Password: password123
Role: admin

Email: ngo@giveway.org
Password: password123
Role: ngo_admin

Email: user@giveway.org
Password: password123
Role: user
```

## Troubleshooting

### Port 5432 Already in Use
```bash
# Kill the process using port 5432
lsof -ti:5432 | xargs kill -9

# Or change DATABASE_URL to use different port
```

### Database Connection Error
```bash
# Check PostgreSQL is running
psql -U giveway -h localhost -d giveway

# Check connection string in .env.local
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"
```

### Migration Issues
```bash
# Reset database (WARNING: deletes all data)
npm run migrate:reset

# Generate Prisma client
npm run prisma:generate
```

## Deployment

### Vercel (with Neon PostgreSQL)
1. Create Neon database
2. Set DATABASE_URL to Neon connection string
3. Deploy backend to Railway, Render, or similar

### Railway
1. Connect GitHub repository
2. Set DATABASE_URL environment variable
3. Railway auto-deploys on push

### Docker
```bash
docker build -f backend/Dockerfile -t giveway-backend .
docker run -p 4000:4000 \
  -e DATABASE_URL="postgresql://..." \
  giveway-backend
```

## Security

- JWT tokens expire after 7 days
- Passwords are hashed with bcryptjs
- CORS configured for frontend origin
- Input validation on all routes
- No sensitive data in error messages (production)

## Performance Tips

1. Use database indexes on frequently queried fields
2. Implement pagination for large result sets
3. Cache NGO listings
4. Use connection pooling for PostgreSQL
5. Enable Prisma query logging in development

## Support & Documentation

- [Express.js](https://expressjs.com/)
- [Prisma](https://www.prisma.io/docs/)
- [PostgreSQL](https://www.postgresql.org/docs/)
- [JWT](https://jwt.io/introduction)
- [bcryptjs](https://github.com/dcodeIO/bcrypt.js)
