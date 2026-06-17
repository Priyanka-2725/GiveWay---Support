# 🚀 Run Without Docker - Local Setup Guide

Follow these steps to run the full stack locally.

---

## 📋 Prerequisites

- Node.js 18+ (download from https://nodejs.org)
- PostgreSQL 12+ 
- npm or yarn

Check versions:
```bash
node --version
npm --version
```

---

## Step 1: Install PostgreSQL

### Option A: Windows (Easiest - Download Installer)

1. Download from: https://www.postgresql.org/download/windows/
2. Run installer
3. Set password to: `giveway_pass`
4. Port: `5432`
5. Finish installation

### Option B: Windows (Using Chocolatey)

```bash
choco install postgresql
# Set password: giveway_pass
# Port: 5432
```

### Option C: Windows (Using WSL2 + Docker)

```bash
# Just Docker, no full Docker Compose
docker run -d \
  --name giveway-postgres \
  -e POSTGRES_USER=giveway \
  -e POSTGRES_PASSWORD=giveway_pass \
  -e POSTGRES_DB=giveway \
  -p 5432:5432 \
  postgres:15-alpine
```

### Option D: Mac (Using Homebrew)

```bash
brew install postgresql@15
brew services start postgresql@15
```

### Option E: Linux (Ubuntu/Debian)

```bash
sudo apt update
sudo apt install postgresql-15
sudo systemctl start postgresql
```

---

## Step 2: Create Database & User

Open PostgreSQL command line:

### Windows (PowerShell as Admin):
```bash
psql -U postgres
```

### Mac/Linux:
```bash
sudo -u postgres psql
```

### Then run these SQL commands:

```sql
CREATE DATABASE giveway;
CREATE USER giveway WITH PASSWORD 'giveway_pass';
ALTER ROLE giveway SET client_encoding TO 'utf8';
ALTER ROLE giveway SET default_transaction_isolation TO 'read committed';
ALTER ROLE giveway SET default_transaction_deferrable TO on;
ALTER ROLE giveway SET default_time_zone TO 'UTC';
GRANT ALL PRIVILEGES ON DATABASE giveway TO giveway;
\q
```

---

## Step 3: Verify Database Connection

```bash
psql -U giveway -h localhost -d giveway -c "SELECT 1"
```

Should output:
```
 ?column? 
----------
        1
(1 row)
```

---

## Step 4: Install Backend Dependencies

```bash
cd backend
npm install
```

Wait for installation to complete (~2-3 minutes).

---

## Step 5: Configure Environment

```bash
# In backend/ folder, verify .env.local exists
# It should already have the correct values
cat .env.local
```

Expected contents:
```
DATABASE_URL="postgresql://giveway:giveway_pass@localhost:5432/giveway"
JWT_SECRET="dev-secret-key-change-in-production"
JWT_EXPIRES_IN="7d"
PORT=4000
NODE_ENV="development"
CORS_ORIGIN="http://localhost:3000"
```

If file doesn't exist, create it:
```bash
cp .env.example .env.local
```

---

## Step 6: Run Database Migrations

```bash
# Still in backend/ folder
npm run migrate:dev
```

You'll see:
```
✓ Database synchronized with Prisma schema
✓ Prisma client generated
```

---

## Step 7: Seed Database with Test Data

```bash
npm run seed
```

You'll see:
```
🌱 Seeding database...
✅ Created users: [...]
✅ Created NGOs: [...]
✅ Seeding complete!
```

---

## Step 8: Start Backend Server

```bash
npm run dev
```

You should see:
```
🚀 Server running on port 4000
Environment: development
```

**Leave this terminal running!**

---

## Step 9: Install Frontend Dependencies

Open **another terminal** and run:

```bash
cd ..  # back to root
npm install
```

Wait for installation (~2-3 minutes).

---

## Step 10: Start Frontend

```bash
npm run dev
```

You should see:
```
  ▲ Next.js 15.5.9
  - Local:        http://localhost:3000
```

---

## 🎉 You're Running!

### Terminals Setup:
- **Terminal 1:** Backend running on port 4000 (npm run dev in backend/)
- **Terminal 2:** Frontend running on port 3000 (npm run dev in root)

### Test It:

1. Open browser: **http://localhost:3000**
2. Login with:
   - Email: `user@giveway.org`
   - Password: `password123`
3. Try creating a donation or viewing NGOs
4. Open DevTools → Network tab to see API calls to `localhost:4000`

---

## 🗄️ View Database

In **another terminal**, run:

```bash
cd backend
npm run prisma:studio
```

Browser opens to: **http://localhost:5555**

You can view and edit all tables directly!

---

## 🆘 Troubleshooting

### PostgreSQL Won't Start

```bash
# Windows - Start service
net start postgresql-x64-15

# Mac
brew services start postgresql@15

# Linux
sudo systemctl start postgresql
```

### Port 5432 Already in Use

```bash
# Kill process using port 5432
# Windows (PowerShell as Admin):
Get-Process -Id (Get-NetTCPConnection -LocalPort 5432).OwningProcess | Stop-Process

# Mac/Linux:
lsof -ti:5432 | xargs kill -9
```

### Database Connection Error

```bash
# Test connection
psql -U giveway -h localhost -d giveway

# If fails, check:
# 1. PostgreSQL running?
# 2. User exists?
# 3. Password correct?
# 4. Database exists?
```

### Migrations Fail

```bash
# Regenerate Prisma client
cd backend
npm run prisma:generate

# Reset database (WARNING: deletes all data)
npm run migrate:reset

# Run migrations again
npm run migrate:dev
npm run seed
```

### Backend Can't Connect to Database

```bash
# Check DATABASE_URL in backend/.env.local
cat backend/.env.local

# Verify format:
# postgresql://giveway:giveway_pass@localhost:5432/giveway
```

### Frontend Can't Connect to Backend

```bash
# Make sure backend is running on 4000
curl http://localhost:4000/health

# Should return:
# {"status":"OK","timestamp":"..."}
```

### Port 3000 or 4000 Already in Use

```bash
# Windows (PowerShell as Admin):
Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess | Stop-Process

# Or change port:
cd backend
# In .env.local change: PORT=4001

# Mac/Linux:
lsof -ti:3000 | xargs kill -9
lsof -ti:4000 | xargs kill -9
```

---

## 📊 Development Commands

### Backend (in backend/ folder)

```bash
npm run dev              # Start dev server
npm run build            # Build TypeScript
npm run start            # Run production build
npm run typecheck        # Check TypeScript errors
npm run lint             # Run ESLint
npm run migrate:dev      # Create migration and apply
npm run migrate          # Apply existing migrations
npm run migrate:reset    # Reset database
npm run seed             # Seed test data
npm run prisma:generate  # Generate Prisma client
npm run prisma:studio    # Open database UI
```

### Frontend (in root folder)

```bash
npm run dev              # Start dev server
npm run build            # Build for production
npm run start            # Run production build
npm run lint             # Run linter
npm run typecheck        # Check TypeScript
```

---

## 🔍 Check Everything is Working

### Terminal 1 Check (Backend)
```bash
curl http://localhost:4000/health
# Response: {"status":"OK","timestamp":"2026-06-17T..."}
```

### Terminal 2 Check (Frontend)
```bash
curl http://localhost:3000
# Response: HTML content of Next.js app
```

### Browser Check
1. Open http://localhost:3000
2. You should see the login page
3. Login with `user@giveway.org` / `password123`
4. Navigate around the app
5. Open DevTools → Network tab
6. Make a request (click a button)
7. You should see requests to `localhost:4000/api/...`

---

## 📈 What's Running

| Service | Port | Status | Command |
|---------|------|--------|---------|
| PostgreSQL | 5432 | ✅ Running | (system service) |
| Backend API | 4000 | ✅ Running | `cd backend && npm run dev` |
| Frontend | 3000 | ✅ Running | `npm run dev` |

---

## 🧪 Test Features

### 1. Login
- Email: `user@giveway.org`
- Password: `password123`

### 2. View NGOs
- Click "Discover"
- See list from database

### 3. Make Donation
- Click an NGO
- Click "Donate"
- Enter amount
- See in database via `npm run prisma:studio`

### 4. Apply as Volunteer
- Click an NGO
- Click "Apply as Volunteer"
- See request in database

### 5. Check Notifications
- Make changes as different users
- Check notification bell
- Notifications from database

---

## 💾 Stop Services

When you want to stop:

```bash
# Terminal 1 (Backend):
Ctrl+C

# Terminal 2 (Frontend):
Ctrl+C

# PostgreSQL:
# Leave running (system service)
# Or on Windows: net stop postgresql-x64-15
```

---

## 🚀 Next Steps

### Development
- Make API changes in `backend/src/`
- Make UI changes in `src/`
- Both auto-reload on save!

### Testing
- Use Postman to test API
- Use `curl` commands
- Test in browser

### Debugging
- Backend logs in Terminal 1
- Frontend errors in Terminal 2
- Browser console (F12)
- Database browser: `npm run prisma:studio`

### Deployment
- When ready: See `DEPLOY_NOW.md`

---

## 📞 Quick Reference

### Start Everything Fresh
```bash
# Terminal 1
cd backend
npm install
npm run migrate:dev
npm run seed
npm run dev

# Terminal 2
npm install
npm run dev

# Terminal 3 (optional)
cd backend
npm run prisma:studio
```

### Database Reset
```bash
# WARNING: Deletes all data!
cd backend
npm run migrate:reset
npm run seed
```

### Find Errors
```bash
# Backend errors
cd backend
npm run typecheck

# Frontend errors
npm run typecheck
```

---

**You're all set! Happy coding! 🎉**

Need help? Check troubleshooting section above or see `FULLSTACK_SETUP.md`.
