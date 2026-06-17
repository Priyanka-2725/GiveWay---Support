# GiveWay - Quick Reference Guide

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Open browser
http://localhost:9002

# Login
Email: superadmin@giveway.org
Password: password123
```

---

## Key Files Map

| File | Purpose |
|------|---------|
| `src/contexts/auth-context.tsx` | Global authentication state |
| `src/lib/api-client.ts` | All data operations |
| `src/data/*.ts` | Mock data files |
| `src/components/` | React components |
| `src/app/` | Next.js routes |
| `package.json` | Dependencies |
| `.env` | Environment variables |

---

## Common Tasks

### Add Authentication

```typescript
import { useAuth } from '@/contexts/auth-context'

function MyComponent() {
  const { user, isLoading, login, logout } = useAuth()
  
  if (isLoading) return <Loading />
  if (!user) return <Login onSubmit={login} />
  
  return <Dashboard />
}
```

### Fetch Data

```typescript
const [data, setData] = useState([])
const [isLoading, setIsLoading] = useState(false)

useEffect(() => {
  const fetch = async () => {
    setIsLoading(true)
    try {
      const res = await apiClient.getData()
      setData(res.data)
    } finally {
      setIsLoading(false)
    }
  }
  fetch()
}, [])
```

### Create Data

```typescript
const handleCreate = async (formData) => {
  try {
    const res = await apiClient.createItem(formData)
    setItems(prev => [...prev, res.item])
    toast.success('Created!')
  } catch (err) {
    toast.error(err.message)
  }
}
```

### Update Data

```typescript
const handleUpdate = async (id, changes) => {
  try {
    await apiClient.updateItem(id, changes)
    setItems(prev => prev.map(i => i.id === id ? { ...i, ...changes } : i))
    toast.success('Updated!')
  } catch (err) {
    toast.error(err.message)
  }
}
```

### Delete Data

```typescript
const handleDelete = async (id) => {
  if (!confirm('Are you sure?')) return
  try {
    await apiClient.deleteItem(id)
    setItems(prev => prev.filter(i => i.id !== id))
    toast.success('Deleted!')
  } catch (err) {
    toast.error(err.message)
  }
}
```

---

## API Client Methods

### Authentication

```typescript
apiClient.login(email, password)
apiClient.signup(email, password, name, role)
apiClient.getCurrentUser()
apiClient.logout()
apiClient.updateUser(id, data)
```

### NGOs

```typescript
apiClient.getNgos(params)           // { verified?, limit?, cause?, state? }
apiClient.getNgo(id)
apiClient.createNgo(data)
apiClient.updateNgo(id, data)
apiClient.deleteNgo(id)
```

### Donations

```typescript
apiClient.getDonations(params)      // { userId?, ngoId?, limit? }
apiClient.createDonation(amount, userId, ngoId)
```

### Volunteers

```typescript
apiClient.getVolunteerRequests(params)
apiClient.createVolunteerRequest(data)
apiClient.updateVolunteerRequest(id, data)
```

### Users

```typescript
apiClient.followNgo(userId, ngoId)
apiClient.unfollowNgo(userId, ngoId)
```

---

## Role-Based Access Control

```typescript
const { user } = useAuth()

// Check roles
const isSuperAdmin = user?.role === 'superadmin'
const isAdmin = user?.role === 'admin'
const isNgoAdmin = user?.role === 'ngo_admin'
const isUser = user?.role === 'user'

// Conditional rendering
{isSuperAdmin && <AdminPanel />}
{isNgoAdmin && <NgoControls />}
```

---

## Form Handling

```typescript
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const schema = z.object({
  name: z.string().min(1, 'Name required'),
  email: z.string().email(),
})

function MyForm() {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema)
  })

  return (
    <form onSubmit={handleSubmit(async (data) => {
      try {
        await apiClient.createItem(data)
      } catch (err) {
        console.error(err)
      }
    })}>
      <input {...register('name')} />
      {errors.name && <p>{errors.name.message}</p>}
      <button type="submit">Submit</button>
    </form>
  )
}
```

---

## UI Components

### Common Components

```typescript
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Loader2 } from 'lucide-react'

function MyComponent() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <Card>
      <CardHeader>
        <CardTitle>My Component</CardTitle>
      </CardHeader>
      <CardContent>
        <Input placeholder="Search..." />
        <Button onClick={() => setIsOpen(true)}>
          Open Dialog
        </Button>
        <Badge variant="secondary">Badge</Badge>

        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Dialog Title</DialogTitle>
            </DialogHeader>
            {/* content */}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}
```

---

## Toast Notifications

```typescript
import { useToast } from '@/hooks/use-toast'

function MyComponent() {
  const { toast } = useToast()

  const handleSuccess = () => {
    toast({
      title: 'Success!',
      description: 'Operation completed',
      duration: 3000,
    })
  }

  const handleError = () => {
    toast({
      variant: 'destructive',
      title: 'Error!',
      description: 'Something went wrong',
    })
  }

  return (
    <div>
      <Button onClick={handleSuccess}>Show Success</Button>
      <Button onClick={handleError}>Show Error</Button>
    </div>
  )
}
```

---

## localStorage Access

```typescript
// Get active user
const user = JSON.parse(localStorage.getItem('giveway_local_active_user'))

// Get all users
const users = JSON.parse(localStorage.getItem('giveway_local_users'))

// Get NGOs
const ngos = JSON.parse(localStorage.getItem('giveway_local_ngos'))

// Clear all
localStorage.clear()

// Clear specific key
localStorage.removeItem('giveway_local_donations')
```

---

## Common Patterns

### Loading State Pattern

```typescript
const [isLoading, setIsLoading] = useState(false)

useEffect(() => {
  const fetch = async () => {
    setIsLoading(true)
    try {
      // ... fetch data
    } finally {
      setIsLoading(false)
    }
  }
  fetch()
}, [])

if (isLoading) return <Spinner />
```

### Error Handling Pattern

```typescript
const [error, setError] = useState<string | null>(null)

try {
  // ... operation
} catch (err: any) {
  setError(err.message)
  toast({ variant: 'destructive', title: 'Error', description: err.message })
}
```

### Optimistic Update Pattern

```typescript
const handleCreate = async (formData) => {
  // Optimistically update UI
  const newItem = { id: Date.now(), ...formData }
  setItems(prev => [...prev, newItem])

  try {
    // Then persist to storage
    const res = await apiClient.createItem(formData)
    // If different, update with actual response
    setItems(prev => prev.map(i => i.id === newItem.id ? res.item : i))
  } catch (err) {
    // Revert on error
    setItems(prev => prev.filter(i => i.id !== newItem.id))
    toast.error(err.message)
  }
}
```

---

## Debugging

### Enable Console Logs

```typescript
// In any component
console.log('Auth state:', user)
console.log('NGOs:', ngos)
console.log('Token:', apiClient.getToken())
```

### Check localStorage in DevTools

```javascript
// In browser console
Object.keys(localStorage)                           // See all keys
localStorage.getItem('giveway_local_users')        // View specific data
JSON.parse(localStorage.getItem('giveway_local_ngos')) // Parse and view
localStorage.clear()                               // Clear everything
```

### Add Debugging to ApiClient

```typescript
// In src/lib/api-client.ts - add logging
async getNgos(params?: any) {
  console.log('[API] getNgos', params)
  const result = this.getStoredNgos(params)
  console.log('[API] result', result)
  return result
}
```

---

## Performance Tips

1. **Use React.memo for components**
```typescript
export const NgoCard = React.memo(function NgoCard({ ngo }) {
  return <Card>{ngo.name}</Card>
})
```

2. **Memoize expensive computations**
```typescript
const stats = useMemo(() => {
  return donations.reduce((sum, d) => sum + d.amount, 0)
}, [donations])
```

3. **Lazy load components**
```typescript
const HeavyComponent = lazy(() => import('./HeavyComponent'))

function App() {
  return (
    <Suspense fallback={<Loading />}>
      <HeavyComponent />
    </Suspense>
  )
}
```

4. **Use virtual scrolling for long lists**
```typescript
import { virtualizeComponents } from 'react-window'
```

---

## Testing

```bash
# Run linter
npm run lint

# Type check
npm run typecheck

# Build
npm run build
```

---

## Environment Variables

```bash
# .env
GEMINI_API_KEY=...              # For AI features
DATABASE_URL=...                # For future database
JWT_SECRET=...                  # For token signing
NEXT_PUBLIC_API_URL=http://localhost:9002  # Frontend API URL
```

---

## Mock Data Users

| Email | Password | Role |
|-------|----------|------|
| superadmin@giveway.org | password123 | superadmin |
| admin@giveway.org | password123 | admin |
| ngo@giveway.org | password123 | ngo_admin |
| Any new email | (auto-created) | user |

---

## Troubleshooting

### Issue: "Not authenticated"

**Solution:**
1. Check if user is logged in: `useAuth()` should have user
2. Check localStorage: `localStorage.getItem('giveway_local_active_user')`
3. Check token: `localStorage.getItem('auth_token')`
4. Clear storage and login again: `localStorage.clear()`

### Issue: Data not persisting

**Solution:**
1. Check if you're calling the right apiClient method
2. Verify localStorage is enabled in browser
3. Check browser storage limit (5-10MB)
4. Clear localStorage and reload

### Issue: Components not updating

**Solution:**
1. Verify state is being set: `console.log(data)`
2. Check useEffect dependencies
3. Verify data is actually changing
4. Use React DevTools to check component state

---

## Useful Links

- [Next.js Docs](https://nextjs.org/docs)
- [React Docs](https://react.dev)
- [TypeScript Docs](https://www.typescriptlang.org/docs)
- [Tailwind CSS](https://tailwindcss.com)
- [Shadcn/ui](https://ui.shadcn.com)
- [React Hook Form](https://react-hook-form.com)

---

## Need Help?

1. **Check existing components** - similar patterns in codebase
2. **Read docs** - in `/docs/` folder
3. **Check localStorage** - inspect data directly
4. **Add console logs** - trace execution
5. **Read error messages** - usually descriptive
