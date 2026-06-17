# GiveWay - Local-First Architecture Guide

## Overview

GiveWay is a **local-first, client-side rendered Next.js application** with zero backend dependencies. All data is stored in the browser's localStorage and managed through React state.

---

## Architecture Layers

### 1. Presentation Layer (React Components)

**Location:** `src/components/`, `src/app/`

**Responsibilities:**
- UI rendering
- User interactions
- Form handling
- State management via hooks
- Loading/error states

**Key Components:**
- `src/contexts/auth-context.tsx` - Global auth state
- `src/components/header.tsx` - Navigation
- `src/components/ngo-card.tsx` - NGO display
- `src/components/donation-modal.tsx` - Donation flow
- `src/components/volunteer-modal.tsx` - Volunteer flow

---

### 2. API Client Layer (Local Operations)

**Location:** `src/lib/api-client.ts`

**Responsibilities:**
- Centralized data operations
- localStorage management
- Data validation and normalization
- Token management
- Consistent interface for components

**Key Methods:**

```typescript
// Authentication
class ApiClient {
  login(email, password)           // Validate user, set token
  signup(email, password, name)    // Create user, set token
  getCurrentUser()                  // Get active user
  logout()                          // Clear token & user
}

// NGOs
getNgos(params)                     // Fetch NGOs with filtering
getNgo(id)                          // Get single NGO
createNgo(data)                     // Create NGO
updateNgo(id, data)                 // Update NGO
deleteNgo(id)                       // Delete NGO

// Donations
getDonations(params)                // Fetch donations
createDonation(amount, userId, ngoId)

// Volunteers
getVolunteerRequests(params)
createVolunteerRequest(data)

// Users
followNgo(userId, ngoId)
unfollowNgo(userId, ngoId)
getNotifications(userId)
```

---

### 3. Data Layer (localStorage + Mock Data)

**Location:** `src/data/`, browser localStorage

**Storage Strategy:**

```javascript
// localStorage keys
giveway_local_users              // All registered users
giveway_local_active_user        // Currently logged-in user
giveway_local_ngos               // NGO database
giveway_local_donations          // Donation records
giveway_local_volunteers         // Volunteer requests
giveway_local_notifications      // Notifications
auth_token                       // Auth token

// Mock data (fallback)
src/data/users.ts               // Seed users
src/data/ngos.ts                // Seed NGOs
src/data/donations.ts           // Seed donations
src/data/volunteerRequests.ts   // Seed volunteer data
src/data/notifications.ts       // Seed notifications
src/data/feedData.ts            // Activity feed
```

**Data Flow:**

```
Components
    ↓
useAuth() hook / apiClient
    ↓
API Client methods
    ↓
localStorage read/write
    ↓
Mock data (fallback)
```

---

## Authentication Flow

### Signup

```typescript
// 1. User enters email/password
<form onSubmit={handleSignup}>
  <input type="email" name="email" />
  <input type="password" name="password" />
  <input type="text" name="name" />
</form>

// 2. Form submission
const handleSignup = async (email, password, name) => {
  const response = await apiClient.signup(email, password, name)
  // response = { user, token }
}

// 3. ApiClient validates & creates user
async signup(email, password, name) {
  const users = readStoredUsers()  // Read from localStorage
  const user = { id, email, password, name, role: 'user' }
  users.push(user)
  writeStoredUsers(users)          // Write to localStorage
  setToken(token)                  // Store auth token
  return { user, token }
}

// 4. Auth Context updates
setUser(response.user)
setIsLoading(false)

// 5. Component re-renders
{user && <Redirect to="/discover" />}
```

### Login

```typescript
// 1. Find user by email
const user = users.find(u => u.email === email && u.password === password)

// 2. If not found, create new user (auto-signup)
if (!user) {
  user = { id, email, password, name: email.split('@')[0], role: 'user' }
  users.push(user)
}

// 3. Set active user & token
writeActiveUser(user)
setToken(`local-${user.id}`)

// 4. Return to components
return { user, token }
```

### Logout

```typescript
// Clear active user & token
apiClient.logout()
// → removes from localStorage
// → clears auth state
// → redirects to /login
```

---

## Data Operations

### NGO Operations

**Create NGO:**
```typescript
// 1. User fills form
const ngoData = {
  name: "Hope Foundation",
  description: "...",
  cause: "education",
  // ...
}

// 2. Submit
const response = await apiClient.createNgo(ngoData)

// 3. ApiClient normalizes & stores
function createNgo(ngoData) {
  const ngos = readStoredNgos()
  const ngo = normalizeNgo({
    id: crypto.randomUUID(),
    ...ngoData,
    verified: false,
    createdAt: now,
  })
  ngos.unshift(ngo)
  writeStoredNgos(ngos)  // Save to localStorage
  return { ngo }
}

// 4. Component receives response
setNgos(prev => [response.ngo, ...prev])
```

**Update NGO:**
```typescript
const response = await apiClient.updateNgo(ngoId, {
  name: "New Name",
  verified: true,
})
// → Finds NGO in localStorage
// → Updates fields
// → Saves back to localStorage
```

**Delete NGO:**
```typescript
await apiClient.deleteNgo(ngoId)
// → Filters out NGO from storage
// → Also removes related donations
// → Saves to localStorage
```

---

## Real-Time State Pattern

### Fetching Data

```typescript
const [ngos, setNgos] = useState([])
const [isLoading, setIsLoading] = useState(false)

useEffect(() => {
  const fetchNgos = async () => {
    setIsLoading(true)
    try {
      const response = await apiClient.getNgos()
      setNgos(response.ngos)
    } catch (err) {
      console.error('Error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  fetchNgos()
}, [])

// Render
if (isLoading) return <Spinner />
return <NGOList ngos={ngos} />
```

### Creating Data

```typescript
const handleCreateDonation = async (amount, ngoId) => {
  try {
    setIsLoading(true)
    const response = await apiClient.createDonation(
      amount,
      user.id,
      ngoId
    )
    // Optimistically update UI
    setDonations(prev => [...prev, response.donation])
    toast.success('Donation recorded!')
  } catch (err) {
    toast.error(err.message)
  } finally {
    setIsLoading(false)
  }
}
```

### Filtering Data

```typescript
// Client-side filtering
const filteredNgos = ngos.filter(ngo => {
  return (
    ngo.cause === selectedCause &&
    ngo.state === selectedState &&
    (ngo.name.includes(searchTerm))
  )
})
```

---

## Data Persistence

### localStorage Structure

```javascript
// Individual entries
localStorage.setItem('giveway_local_users', JSON.stringify([
  {
    id: "user_1",
    email: "user@example.com",
    name: "John Doe",
    role: "user",
    password: "password123",
    followingNgoIds: ["ngo_1", "ngo_2"],
  },
  // ... more users
]))

// Cloning data (to avoid mutations)
const users = JSON.parse(localStorage.getItem('giveway_local_users'))
const updated = clone(users)
updated[0].name = "New Name"
localStorage.setItem('giveway_local_users', JSON.stringify(updated))
```

### Data Survival

- **Page Refresh:** ✅ Data persists (in localStorage)
- **Tab Close:** ✅ Data persists (in localStorage)
- **Browser Close:** ✅ Data persists (in localStorage)
- **Browser Cache Clear:** ❌ Data cleared (need to reset to mock data)
- **localStorage Clear:** ❌ Data cleared (mock data fallback)

---

## Role-Based Access Control

### Roles

```typescript
type Role = 'superadmin' | 'admin' | 'ngo_admin' | 'user'

// User object
interface User {
  id: string
  email: string
  name: string
  role: Role  // Determines permissions
}
```

### Permission Patterns

**Superadmin Only:**
```typescript
if (user?.role !== 'superadmin') {
  return <Forbidden />
}
```

**Admin & Superadmin:**
```typescript
const isAdmin = user?.role === 'admin' || user?.role === 'superadmin'
if (!isAdmin) {
  return <Forbidden />
}
```

**NGO Membership Check:**
```typescript
const isMember = ngo.members[user?.id] !== undefined
const isOwner = ngo.members[user?.id] === 'owner'
const isManager = ngo.members[user?.id] === 'manager'
```

---

## Component Integration Example

### Typical Component Flow

```typescript
'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/auth-context'
import apiClient from '@/lib/api-client'

export default function MyComponent() {
  const { user } = useAuth()                    // Get auth state
  const [data, setData] = useState([])          // Local state
  const [isLoading, setIsLoading] = useState(false)

  // Fetch data on mount
  useEffect(() => {
    if (!user?.id) return
    
    const fetchData = async () => {
      setIsLoading(true)
      try {
        const response = await apiClient.getSomething()
        setData(response.data)
      } catch (err) {
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchData()
  }, [user?.id])

  // Handle mutation
  const handleCreate = async (formData) => {
    try {
      const response = await apiClient.createSomething(formData)
      setData(prev => [...prev, response.item])
    } catch (err) {
      alert(err.message)
    }
  }

  return (
    <div>
      {isLoading ? <Spinner /> : <DataList data={data} />}
      <CreateForm onSubmit={handleCreate} />
    </div>
  )
}
```

---

## Testing Locally

### Mock Users Available

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
```

### Testing Data Creation

1. **Create NGO:** Use NGO creation form on ngo-dashboard
2. **Make Donation:** Use donation modal on NGO profile
3. **Volunteer:** Use volunteer modal on NGO profile
4. **Follow NGO:** Click follow button
5. **View Dashboard:** See aggregated donor stats

### Persistence Testing

1. Create data
2. Refresh page → data persists ✅
3. Open DevTools → Application → Storage → localStorage
4. See keys: `giveway_local_*`
5. Modify values directly to test edge cases

---

## File Structure

```
src/
├── app/                          # Next.js routes
│   ├── api/                      # API route handlers (can add real endpoints here)
│   ├── auth/                     # Auth pages (login, signup, etc.)
│   ├── dashboard/                # User dashboard
│   ├── discover/                 # NGO discovery
│   ├── ngos/                     # NGO detail pages
│   ├── admin/                    # Admin panel
│   └── layout.tsx                # Root layout
├── components/                   # React components
│   ├── ui/                       # shadcn/ui components
│   ├── feed/                     # Feed components
│   ├── lazy/                     # Lazy-loaded components
│   ├── skeletons/                # Loading skeletons
│   └── *.tsx                     # Feature components
├── contexts/                     # React contexts
│   └── auth-context.tsx          # Global auth state
├── data/                         # Mock data
│   ├── users.ts                  # User seed data
│   ├── ngos.ts                   # NGO seed data
│   ├── donations.ts              # Donation seed data
│   ├── volunteerRequests.ts      # Volunteer seed data
│   ├── notifications.ts          # Notification seed data
│   └── feedData.ts               # Feed seed data
├── hooks/                        # Custom React hooks
│   ├── use-auth.ts               # Auth hook
│   └── use-toast.ts              # Toast hook
├── lib/                          # Utilities
│   ├── api-client.ts             # Local API operations
│   ├── utils.ts                  # Helper functions
│   └── placeholder-images.ts     # Image utilities
└── types/                        # TypeScript types
    └── index.ts                  # Type definitions
```

---

## Key Patterns

### Error Handling

```typescript
try {
  const response = await apiClient.operation()
  setData(response.data)
} catch (err: any) {
  setError(err.message || 'An error occurred')
  toast({ variant: 'destructive', title: 'Error', description: err.message })
}
```

### Loading States

```typescript
const [isLoading, setIsLoading] = useState(false)

useEffect(() => {
  setIsLoading(true)
  // ... fetch
  setIsLoading(false)
}, [])

if (isLoading) return <Spinner />
```

### Empty States

```typescript
{data.length === 0 ? (
  <EmptyState message="No data found" />
) : (
  <DataList data={data} />
)}
```

---

## Extending the Architecture

### Adding New Data Type

1. **Create mock data file:** `src/data/newType.ts`
2. **Add API client methods:** `src/lib/api-client.ts`
3. **Create localStorage key:** in api-client
4. **Create React hook** (optional): `src/hooks/useNewType.ts`
5. **Use in components:** `const data = await apiClient.getNewType()`

### Example: Adding Testimonials

```typescript
// 1. src/data/testimonials.ts
export interface Testimonial {
  id: string
  ngoId: string
  userId: string
  content: string
  rating: number
  createdAt: string
}

export const mockTestimonials: Testimonial[] = [
  { id: '1', ngoId: 'ngo_1', userId: 'user_1', content: '...', rating: 5, createdAt: new Date().toISOString() },
]

// 2. Add to api-client.ts
const LOCAL_TESTIMONIALS_KEY = 'giveway_local_testimonials'

async getTestimonials(params?: { ngoId?: string }) {
  let testimonials = readStoredValue<Testimonial[]>(LOCAL_TESTIMONIALS_KEY, mockTestimonials)
  if (params?.ngoId) {
    testimonials = testimonials.filter(t => t.ngoId === params.ngoId)
  }
  return { testimonials: clone(testimonials) }
}

async createTestimonial(data: Partial<Testimonial>) {
  const testimonials = readStoredValue<Testimonial[]>(LOCAL_TESTIMONIALS_KEY, mockTestimonials)
  const testimonial: Testimonial = {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    ...data,
  }
  testimonials.push(testimonial)
  writeStoredValue(LOCAL_TESTIMONIALS_KEY, testimonials)
  return { testimonial: clone(testimonial) }
}

// 3. Use in component
const [testimonials, setTestimonials] = useState<Testimonial[]>([])

useEffect(() => {
  const fetch = async () => {
    const response = await apiClient.getTestimonials({ ngoId })
    setTestimonials(response.testimonials)
  }
  fetch()
}, [ngoId])
```

---

## Debugging Tips

### Check localStorage in Browser

```javascript
// In DevTools Console
localStorage.getItem('giveway_local_users')     // View users
localStorage.getItem('giveway_local_ngos')      // View NGOs
localStorage.getItem('giveway_local_donations') // View donations
localStorage.getItem('auth_token')              // View token

// Clear everything
localStorage.clear()

// Reset to mock data (reload page)
```

### Check Active User

```javascript
// In DevTools Console
JSON.parse(localStorage.getItem('giveway_local_active_user'))
```

### Enable API Client Logging

```typescript
// In src/lib/api-client.ts
console.log('Operation:', 'createNgo')
console.log('Data:', ngoData)
console.log('Saved to storage')
```

---

## Performance Considerations

### Current Limitations

- All data in memory → OK for ~1000 records
- localStorage size limit: ~5-10MB per domain
- No indexing → filtering is O(n)
- Suitable for: demos, prototypes, local development

### Optimization Tips

1. **Pagination:** Slice data before rendering
2. **Memoization:** Use `useMemo()` for computed data
3. **Lazy Loading:** Load components on demand
4. **Virtual Scrolling:** For large lists

---

## Conclusion

GiveWay's local-first architecture is:
- ✅ **Simple:** No complex backend needed
- ✅ **Fast:** All operations instant (in-memory)
- ✅ **Portable:** Works anywhere with Node.js
- ✅ **Extensible:** Easy to add backend later

To migrate to a real backend, simply replace ApiClient methods with HTTP calls to your backend API.
