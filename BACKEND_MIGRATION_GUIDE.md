# GiveWay - Backend Migration Guide

## Overview

This guide explains how to migrate GiveWay from a local-first architecture to a production backend when ready to scale.

---

## Phase 1: Planning & Architecture Decision

### Choose Your Backend Stack

#### Option A: Node.js + Express + PostgreSQL (Recommended for Next.js)

**Pros:**
- Same language ecosystem
- Easy integration with Next.js
- Mature ecosystem
- Good performance

**Setup:**
```bash
npm install express pg cors dotenv jsonwebtoken bcryptjs
```

**Database:**
- PostgreSQL (reliable, open-source)
- Prisma ORM (type-safe queries)

---

#### Option B: Supabase (PostgreSQL + Auth + Storage)

**Pros:**
- Firebase alternative
- Built-in authentication
- Real-time subscriptions available
- PostgreSQL database

**Setup:**
```bash
npm install @supabase/supabase-js
```

---

#### Option C: MongoDB + Node.js + Express

**Pros:**
- Document-based (similar to Firestore)
- Fast schema-less development
- Good for complex data

**Setup:**
```bash
npm install mongoose express cors jsonwebtoken bcryptjs
```

---

#### Option D: Serverless (AWS Lambda + DynamoDB)

**Pros:**
- Scales automatically
- Pay per request
- No infrastructure to manage

**Setup:**
```bash
npm install serverless-http aws-sdk
```

---

## Phase 2: API Design

### Current Local API Structure

```typescript
// Current: LocalStorage-based
class ApiClient {
  // Auth endpoints
  async login(email, password)
  async signup(email, password, name, role)
  async getCurrentUser()

  // NGO endpoints
  async getNgos(params)
  async getNgo(id)
  async createNgo(data)
  async updateNgo(id, data)
  async deleteNgo(id)

  // Donation endpoints
  async getDonations(params)
  async createDonation(amount, userId, ngoId)

  // ... more methods
}
```

### Future: HTTP-based API

```typescript
// Future: HTTP-based
class ApiClient {
  private baseURL = process.env.NEXT_PUBLIC_API_URL

  // Auth endpoints
  async login(email, password) {
    const res = await fetch(`${this.baseURL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    })
    return res.json()
  }

  // NGO endpoints
  async getNgos(params) {
    const query = new URLSearchParams(params)
    const res = await fetch(`${this.baseURL}/ngos?${query}`)
    return res.json()
  }

  // ... convert all methods to HTTP calls
}
```

---

## Phase 3: Database Schema

### PostgreSQL Schema (with Prisma)

```prisma
// prisma/schema.prisma

model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  password  String   // Should be hashed
  role      String   @default("user")
  followingNgos NGO[]
  donations Donation[]
  volunteerRequests VolunteerRequest[]
  createdAt DateTime @default(now())

  @@map("users")
}

model NGO {
  id                String   @id @default(cuid())
  name              String
  description       String?
  ownerId           String
  owner             User     @relation(fields: [ownerId], references: [id])
  shortDescription  String?
  city              String?
  state             String?
  cause             String?
  verified          Boolean  @default(false)
  goalAmount        Float?
  raisedAmount      Float?   @default(0)
  members           Member[]
  donations         Donation[]
  volunteerRequests VolunteerRequest[]
  posts             Post[]
  needs             Need[]
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  @@map("ngos")
}

model Member {
  id     String @id @default(cuid())
  ngoId  String
  ngo    NGO    @relation(fields: [ngoId], references: [id], onDelete: Cascade)
  userId String
  role   String // "owner" | "manager"

  @@unique([ngoId, userId])
  @@map("ngo_members")
}

model Donation {
  id        String   @id @default(cuid())
  amount    Float
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  ngoId     String
  ngo       NGO      @relation(fields: [ngoId], references: [id])
  message   String?
  createdAt DateTime @default(now())

  @@map("donations")
}

model VolunteerRequest {
  id        String   @id @default(cuid())
  ngoId     String
  ngo       NGO      @relation(fields: [ngoId], references: [id])
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  skills    String?
  status    String   @default("pending")
  createdAt DateTime @default(now())

  @@map("volunteer_requests")
}

model Post {
  id        String   @id @default(cuid())
  ngoId     String
  ngo       NGO      @relation(fields: [ngoId], references: [id], onDelete: Cascade)
  title     String
  content   String
  createdAt DateTime @default(now())

  @@map("ngo_posts")
}

model Need {
  id        String   @id @default(cuid())
  ngoId     String
  ngo       NGO      @relation(fields: [ngoId], references: [id], onDelete: Cascade)
  title     String
  quantity  Int?
  createdAt DateTime @default(now())

  @@map("ngo_needs")
}
```

---

## Phase 4: Backend Implementation

### Example: Node.js + Express Backend

```typescript
// backend/src/server.ts
import express from 'express'
import cors from 'cors'
import { PrismaClient } from '@prisma/client'
import bcryptjs from 'bcryptjs'
import jwt from 'jsonwebtoken'

const app = express()
const prisma = new PrismaClient()

app.use(cors())
app.use(express.json())

// Auth Routes
app.post('/auth/signup', async (req, res) => {
  try {
    const { email, password, name, role } = req.body

    // Hash password
    const hashedPassword = await bcryptjs.hash(password, 10)

    // Create user
    const user = await prisma.user.create({
      data: { email, password: hashedPassword, name, role }
    })

    // Generate token
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET
    )

    res.json({ user: { ...user, password: undefined }, token })
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

app.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body

    // Find user
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) throw new Error('User not found')

    // Verify password
    const isValid = await bcryptjs.compare(password, user.password)
    if (!isValid) throw new Error('Invalid password')

    // Generate token
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET
    )

    res.json({ user: { ...user, password: undefined }, token })
  } catch (err) {
    res.status(401).json({ error: err.message })
  }
})

// NGO Routes
app.get('/ngos', async (req, res) => {
  try {
    const { verified, cause, state, limit } = req.query

    const ngos = await prisma.ngo.findMany({
      where: {
        verified: verified ? verified === 'true' : undefined,
        cause: cause && cause !== 'all' ? cause : undefined,
        state: state && state !== 'all' ? state : undefined
      },
      take: limit ? parseInt(limit) : undefined,
      include: { members: true }
    })

    res.json({ ngos })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.get('/ngos/:id', async (req, res) => {
  try {
    const ngo = await prisma.ngo.findUnique({
      where: { id: req.params.id },
      include: { members: true, donations: true }
    })
    if (!ngo) return res.status(404).json({ error: 'NGO not found' })
    res.json({ ngo })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.post('/ngos', async (req, res) => {
  try {
    const { name, description, cause, state, ownerId } = req.body

    const ngo = await prisma.ngo.create({
      data: {
        name, description, cause, state, ownerId,
        members: {
          create: { userId: ownerId, role: 'owner' }
        }
      },
      include: { members: true }
    })

    res.status(201).json({ ngo })
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

// Start server
const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
```

---

## Phase 5: Update ApiClient

### Migration Strategy

**Step 1:** Keep local ApiClient as a wrapper
**Step 2:** Add HTTP method alongside local method
**Step 3:** Switch via environment variable

```typescript
// src/lib/api-client.ts

class ApiClient {
  private isLocal = process.env.NEXT_PUBLIC_USE_LOCAL_API === 'true'
  private baseURL = process.env.NEXT_PUBLIC_API_URL

  async getNgos(params?: any) {
    if (this.isLocal) {
      return this.getLocalNgos(params)  // Current implementation
    } else {
      return this.getRemoteNgos(params) // New HTTP implementation
    }
  }

  // Current local implementation
  private getLocalNgos(params?: any) {
    const ngos = readStoredNgos()
    // ... filter and return
    return { ngos }
  }

  // New remote implementation
  private async getRemoteNgos(params?: any) {
    const query = new URLSearchParams(params)
    const response = await fetch(`${this.baseURL}/ngos?${query}`, {
      headers: { 'Authorization': `Bearer ${this.getToken()}` }
    })
    if (!response.ok) throw new Error('Failed to fetch NGOs')
    return response.json()
  }

  async login(email: string, password: string) {
    if (this.isLocal) {
      return this.localLogin(email, password)
    } else {
      return this.remoteLogin(email, password)
    }
  }

  private localLogin(email: string, password: string) {
    // Current implementation
  }

  private async remoteLogin(email: string, password: string) {
    const response = await fetch(`${this.baseURL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    })
    const data = await response.json()
    this.setToken(data.token)
    return data
  }

  // ... repeat for all methods
}
```

### Environment Setup

```bash
# .env.local (development - use local)
NEXT_PUBLIC_USE_LOCAL_API=true

# .env.production (production - use backend)
NEXT_PUBLIC_USE_LOCAL_API=false
NEXT_PUBLIC_API_URL=https://api.giveway.com
```

---

## Phase 6: Data Migration

### Migrate from localStorage to Database

```typescript
// scripts/migrate-data.ts
import { PrismaClient } from '@prisma/client'
import { mockUsers } from '../src/data/users'
import { ngos as mockNgos } from '../src/data/ngos'
import { mockDonations } from '../src/data/donations'

const prisma = new PrismaClient()

async function migrate() {
  console.log('Starting data migration...')

  // Migrate users
  for (const user of mockUsers) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: {},
      create: {
        email: user.email,
        name: user.name,
        password: user.password, // Should hash in production
        role: user.role
      }
    })
  }
  console.log(`✅ Migrated ${mockUsers.length} users`)

  // Migrate NGOs
  for (const ngo of mockNgos) {
    await prisma.ngo.upsert({
      where: { id: ngo.id },
      update: {},
      create: {
        id: ngo.id,
        name: ngo.name,
        description: ngo.description,
        ownerId: ngo.ownerId,
        // ... other fields
      }
    })
  }
  console.log(`✅ Migrated ${mockNgos.length} NGOs`)

  // Migrate donations
  for (const donation of mockDonations) {
    await prisma.donation.create({
      data: {
        id: donation.id,
        amount: donation.amount,
        userId: donation.userId,
        ngoId: donation.ngoId
      }
    })
  }
  console.log(`✅ Migrated ${mockDonations.length} donations`)

  console.log('✅ Migration complete!')
}

migrate()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
```

Run migration:
```bash
npx ts-node scripts/migrate-data.ts
```

---

## Phase 7: Testing & Validation

### Test API Endpoints

```bash
# Test login
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@giveway.org","password":"password123"}'

# Test get NGOs
curl http://localhost:3001/ngos

# Test get single NGO
curl http://localhost:3001/ngos/ngo_001
```

### Integration Tests

```typescript
// __tests__/api.test.ts
import fetch from 'node-fetch'

describe('API Endpoints', () => {
  const API_URL = 'http://localhost:3001'

  test('Login endpoint', async () => {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@giveway.org',
        password: 'password123'
      })
    })
    const data = await response.json()
    expect(data.token).toBeDefined()
  })

  test('Get NGOs endpoint', async () => {
    const response = await fetch(`${API_URL}/ngos`)
    const data = await response.json()
    expect(data.ngos).toBeInstanceOf(Array)
  })
})
```

---

## Phase 8: Deployment

### Backend Deployment Options

#### Option 1: Heroku

```bash
# Install Heroku CLI
npm install -g heroku

# Login
heroku login

# Create app
heroku create giveway-api

# Add PostgreSQL
heroku addons:create heroku-postgresql:hobby-dev

# Deploy
git push heroku main

# Migrate database
heroku run npx prisma migrate deploy
```

#### Option 2: Railway.app

```bash
# Login
railway login

# Link project
railway link

# Set environment variables
railway variables set DATABASE_URL=postgresql://...
railway variables set JWT_SECRET=...

# Deploy
railway up
```

#### Option 3: Vercel API Routes

```typescript
// api/auth/login.ts
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const { email, password } = req.body
  // ... implementation
}
```

---

## Phase 9: Frontend Integration

### Update Environment Variables

```bash
# .env.production
NEXT_PUBLIC_USE_LOCAL_API=false
NEXT_PUBLIC_API_URL=https://giveway-api.herokuapp.com
```

### Test Integration

1. Start backend: `npm run dev` (backend directory)
2. Start frontend: `npm run dev` (frontend directory)
3. Login: Should call remote API
4. Create NGO: Data persists in PostgreSQL
5. Refresh page: Data loads from database

---

## Migration Checklist

- [ ] Choose backend stack
- [ ] Design database schema
- [ ] Implement backend API
- [ ] Set up Prisma
- [ ] Create migration scripts
- [ ] Update ApiClient with HTTP methods
- [ ] Add environment variable switching
- [ ] Test all endpoints
- [ ] Migrate existing data
- [ ] Deploy backend
- [ ] Update frontend configuration
- [ ] Test end-to-end
- [ ] Monitor and debug
- [ ] Optimize performance

---

## Rollback Strategy

If something goes wrong:

```bash
# Revert to local API
NEXT_PUBLIC_USE_LOCAL_API=true npm run dev

# Data is still in localStorage, no loss
```

---

## Performance Optimization

Once backend is live:

1. **Add Caching:** Redis for frequently accessed data
2. **Pagination:** Limit results per request
3. **Database Indexing:** Create indexes on filtered columns
4. **API Rate Limiting:** Prevent abuse
5. **CDN:** Serve static assets from CDN
6. **Connection Pooling:** For database connections

---

## Security Checklist

Before going to production:

- [ ] Hash all passwords with bcryptjs
- [ ] Validate all inputs on backend
- [ ] Implement HTTPS/TLS
- [ ] Add CORS whitelist
- [ ] Implement JWT token expiration
- [ ] Add refresh token mechanism
- [ ] Rate limit API endpoints
- [ ] Add API authentication
- [ ] Log all errors
- [ ] Regular security audits
- [ ] Keep dependencies updated

---

## Conclusion

Migration steps:
1. **Plan:** Choose stack, design schema
2. **Build:** Implement backend API
3. **Integrate:** Update ApiClient
4. **Migrate:** Move data from localStorage
5. **Test:** Verify all functionality
6. **Deploy:** Launch to production
7. **Monitor:** Track performance and errors

GiveWay is built to make this migration smooth. The ApiClient abstraction means minimal UI changes needed.
