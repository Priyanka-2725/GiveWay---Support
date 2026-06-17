# GiveWay - Full Stack Setup Guide

Your GiveWay application now has a complete backend! Here's how to set everything up and run it locally.

## 📋 What's Included

### Backend (Express.js + PostgreSQL)
✅ Express server on port 4000  
✅ PostgreSQL database (Prisma ORM)  
✅ JWT authentication  
✅ All API endpoints implemented  
✅ Docker Compose for easy setup  

### Frontend (Next.js)
✅ Already running on port 3000  
✅ Connected to backend API  

## 🚀 Quick Start (5 minutes)

### Step 1: Start PostgreSQL + Backend with Docker

```bash
# From project root
docker-compose -f docker-compose.backend.yml up

# This starts:
# - PostgreSQL on port 5432
# - Backend on port 4000
# - Runs migrations automatically
```

### Step 2: In a New Terminal, Run Migrations & Seed

```bash
cd backend
npm install
npm run migrate:dev
npm run seed
```

### Step 3: Start Frontend (if not running)

```bash
cd ..  # back to root
npm run dev
```

### Step 4: Test Login

Visit http://localhost:3000 and login with:
- **Email:** user@giveway.org
- **Password:** password123

That's it! 🎉

---

## 📂 Project Structure

```
GiveWay/
├── src/                          # Frontend (Next.js)
│   ├── app/
│   ├── components/
│   ├── lib/api.ts               # Frontend API client
│   └── ...
├── backend/                      # Backend (Express)
│   ├── src/
│   │   ├── routes/              # API endpoints
│   │   ├── services/            # Business logic
│   │   ├── middleware/          # Auth, errors
│   │   └── index.ts             # Express server
│   ├── Dockerfile
│   ├── package.json
│   └── BACKEND_SETUP.md
├── prisma/
│   ├── schema.prisma            # Database schema
│   ├── migrations/              # Database migrations
│   └── seed.ts                  # Test data
├── docker-compose.backend.yml   # Docker setup
└── package.json
```

---

## 🔧 Manual Setup (Without Docker)

### Prerequisites
- Node.js 18+
- PostgreSQL 12+
- npm or yarn

### 1. Install Backend Dependencies

```bash
cd backend
npm install
```

### 2. Set Up PostgreSQL

**Option A: Using Docker**
```bash
docker run -d \
  --name giveway-postgres \
  -e POSTGRES_USER=giveway \
  -e POSTGRES_PASSWORD=giveway_pass \
  -e POSTGRES_DB=giveway \
  -p 5432:5432 \
  postgres:15-alpine
```

**Option B: Local PostgreSQL**
```bash
# Create database
createdb -U postgres giveway

# Or via psql
psql -U postgres
CREATE DATABASE giveway;
CREATE USER giveway WITH PASSWORD 'giveway_pass';
ALTER ROLE giveway SET client_encoding TO 'utf8';
ALTER ROLE giveway SET default_transaction_isolation TO 'read committed';
ALTER ROLE giveway SET default_transaction_deferrable TO on;
ALTER ROLE giveway SET default_time_zone TO 'UTC';
GRANT ALL PRIVILEGES ON DATABASE giveway TO giveway;
```

### 3. Configure Backend Environment

```bash
# In backend/ folder
cp .env.example .env.local

# Verify DATABASE_URL:
# DATABASE_URL="postgresql://giveway:giveway_pass@localhost:5432/giveway"
```

### 4. Run Migrations

```bash
npm run migrate:dev

# You'll see:
# ✓ Database synchronized
# ✓ Prisma client generated
```

### 5. Seed Database (Optional)

```bash
npm run seed

# Creates test users and NGOs
```

### 6. Start Backend Server

```bash
npm run dev

# You'll see:
# 🚀 Server running on port 4000
# Environment: development
```

### 7. Start Frontend (in another terminal)

```bash
cd ..  # back to root
npm install  # if needed
npm run dev

# Visit http://localhost:3000
```

---

## 📡 API Endpoints

All endpoints require JWT token in Authorization header (except login/register).

### Authentication
```bash
# Register
POST /api/auth/register
{
  "email": "newuser@example.com",
  "password": "password123",
  "name": "New User",
  "role": "user"
}

# Login
POST /api/auth/login
{
  "email": "user@giveway.org",
  "password": "password123"
}
# Returns: { token, user }

# Get current user
GET /api/auth/me
Headers: Authorization: Bearer TOKEN
```

### NGOs
```bash
# List NGOs
GET /api/ngos
GET /api/ngos?verified=true&cause=Education&state=Maharashtra

# Get NGO details
GET /api/ngos/:id

# Create NGO (requires auth)
POST /api/ngos
{
  "name": "New NGO",
  "email": "contact@ngo.org",
  "cause": "Education"
}

# Update NGO
PATCH /api/ngos/:id
{ "description": "Updated description" }

# Delete NGO
DELETE /api/ngos/:id
```

### Donations
```bash
# List donations
GET /api/donations
GET /api/donations?ngoId=ngo-1&userId=user-1

# Create donation
POST /api/donations
{
  "ngoId": "ngo-1",
  "amount": 1000,
  "message": "Keep up the good work!"
}
```

### Volunteers
```bash
# List volunteer requests
GET /api/volunteers
GET /api/volunteers?ngoId=ngo-1

# Create volunteer request
POST /api/volunteers/:ngoId
{
  "skillsOffered": ["Teaching", "Mentoring"],
  "hoursPerWeek": 8,
  "message": "I want to help!"
}

# Update volunteer status
PATCH /api/volunteers/:id/status
{ "status": "accepted" }  # or "rejected"
```

### Notifications
```bash
# Get notifications
GET /api/notifications/:userId

# Mark as read
PATCH /api/notifications/:id/read

# Mark all as read
PATCH /api/notifications/all/read
```

---

## 🧪 Testing the API

### Using cURL

```bash
# 1. Login to get token
TOKEN=$(curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@giveway.org","password":"password123"}' \
  | jq -r '.token')

# 2. Use token for authenticated requests
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:4000/api/auth/me

# 3. List NGOs
curl http://localhost:4000/api/ngos

# 4. Create donation
curl -X POST http://localhost:4000/api/donations \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "ngoId": "ngo-1",
    "amount": 500,
    "message": "Great work!"
  }'
```

### Using Postman

1. Create collection "GiveWay"
2. Create environment with variable: `token` and `baseUrl=http://localhost:4000`
3. Login request:
   - Method: POST
   - URL: `{{baseUrl}}/api/auth/login`
   - Body: `{"email":"user@giveway.org","password":"password123"}`
   - Post-test: `pm.environment.set("token", pm.response.json().token)`
4. Authenticated requests:
   - Add header: `Authorization: Bearer {{token}}`

---

## 🔐 Test Credentials

After seeding database:

```
Username                        Password      Role
─────────────────────────────────────────────────────
superadmin@giveway.org         password123   superadmin
admin@giveway.org              password123   admin
ngo@giveway.org                password123   ngo_admin
user@giveway.org               password123   user
```

---

## 📊 Database Schema

### Users
- Stores user accounts with JWT authentication
- Tracks followed NGOs
- Roles: user, ngo_admin, admin, superadmin

### NGOs
- Organization information
- Verified status
- Impact metrics

### Donations
- Links users to NGOs
- Tracks donation amount and message

### Volunteer Requests
- User applications to volunteer
- Status tracking (pending/accepted/rejected)
- Skills and hours offered

### Notifications
- Real-time user alerts
- Read/unread tracking

### NGO Posts & Needs
- NGO updates and announcements
- Fundraising goals

---

## 🐛 Troubleshooting

### PostgreSQL Connection Error
```bash
# Check if PostgreSQL is running
psql -U giveway -h localhost -d giveway

# If using Docker, check container
docker ps | grep postgres

# Start PostgreSQL container
docker start giveway-postgres
```

### Port Already in Use
```bash
# Backend (4000)
lsof -ti:4000 | xargs kill -9

# PostgreSQL (5432)
lsof -ti:5432 | xargs kill -9
```

### Migration Issues
```bash
# Reset database (WARNING: deletes all data)
npm run migrate:reset

# Regenerate Prisma client
npm run prisma:generate

# View database
npm run prisma:studio
```

### Backend Not Connecting
```bash
# Check environment variables
cat backend/.env.local

# Test database connection
psql -U giveway -h localhost -d giveway -c "SELECT 1"

# Restart backend
npm run dev
```

---

## 📈 Next Steps

### Development
1. ✅ Backend running with PostgreSQL
2. ✅ Frontend connected to backend
3. ✅ Database migrations applied
4. ✅ Test data seeded

### Customization
- Add new API endpoints in `backend/src/routes/`
- Update database schema in `prisma/schema.prisma`
- Add business logic in `backend/src/services/`

### Deployment
- Backend to Railway, Render, or AWS
- Frontend to Vercel
- Database to Neon or AWS RDS

### Features to Add
- Email verification
- Password reset email
- OAuth (Google, GitHub)
- File uploads (avatars, NGO logos)
- Search and filtering
- Analytics

---

## 📚 Documentation

- **Backend Setup**: `backend/BACKEND_SETUP.md`
- **Frontend Deploy**: `DEPLOY_NOW.md`, `DEPLOYMENT_GUIDE.md`
- **Deployment Checklist**: `PRODUCTION_CHECKLIST.md`
- **API Schema**: `prisma/schema.prisma`

---

## 🚀 Deploy Full Stack

### Backend Deployment Options

**Railway (Easiest)**
1. Connect GitHub repo
2. Set `DATABASE_URL` environment variable
3. Auto-deploys on push

**Render.com**
1. Create PostgreSQL database
2. Connect backend GitHub repo
3. Set environment variables

**AWS/Azure/GCP**
1. Deploy backend container
2. Set up managed PostgreSQL
3. Configure environment variables

### Frontend Deployment
1. Deploy to Vercel (recommended)
2. Set `NEXT_PUBLIC_API_URL` to backend API
3. Custom domain setup

---

## ✨ Summary

Your GiveWay application is now **fully connected** with:

✅ Next.js frontend (port 3000)  
✅ Express backend (port 4000)  
✅ PostgreSQL database (port 5432)  
✅ JWT authentication  
✅ All features working  
✅ Ready for deployment  

**Start here:** Run `docker-compose -f docker-compose.backend.yml up` to see it all in action! 🎉
