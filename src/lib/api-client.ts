import { ngos as localNgos } from '@/lib/data'

type LocalNgo = {
  id: string
  name: string
  ownerId: string
  shortDescription: string
  description: string
  city: string
  state: string
  cause: string
  verified: boolean
  goalAmount: number
  raisedAmount: number
  createdAt: string
  updatedAt?: string
  impactScore?: number
  image?: string
  icon?: string
  contactEmail?: string
  members: Record<string, 'owner' | 'manager'>
  posts: any[]
  needs: any[]
}

type LocalDonation = {
  id: string
  amount: number
  userId: string
  userName: string
  ngoId: string
  ngoName: string
  cause?: string
  message?: string
  createdAt: string
}

type LocalUser = {
  id: string
  email: string
  name?: string
  role: string
  password: string
  followingNgoIds?: string[]
  recentSearchTerms?: string[]
}

const LOCAL_USERS_STORAGE_KEY = 'giveway_local_users'
const LOCAL_ACTIVE_USER_STORAGE_KEY = 'giveway_local_active_user'
const LOCAL_NGOS_STORAGE_KEY = 'giveway_local_ngos'
const LOCAL_DONATIONS_STORAGE_KEY = 'giveway_local_donations'

function hasWindow() {
  return typeof window !== 'undefined'
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

function normalizeNgo(ngo: Partial<LocalNgo> & Record<string, any>): LocalNgo {
  return {
    id: ngo.id ?? crypto.randomUUID(),
    name: ngo.name ?? '',
    ownerId: ngo.ownerId ?? '',
    shortDescription: ngo.shortDescription ?? '',
    description: ngo.description ?? '',
    city: ngo.city ?? '',
    state: ngo.state ?? '',
    cause: ngo.cause ?? 'General',
    verified: Boolean(ngo.verified),
    goalAmount: Number(ngo.goalAmount ?? 0),
    raisedAmount: Number(ngo.raisedAmount ?? 0),
    createdAt: ngo.createdAt ?? new Date().toISOString(),
    updatedAt: ngo.updatedAt,
    impactScore: ngo.impactScore,
    image: ngo.image,
    icon: ngo.icon,
    contactEmail: ngo.contactEmail,
    members: ngo.members ?? {},
    posts: Array.isArray(ngo.posts) ? ngo.posts : [],
    needs: Array.isArray(ngo.needs) ? ngo.needs : [],
  }
}

function readStoredValue<T>(storageKey: string, fallback: T): T {
  if (!hasWindow()) {
    return fallback
  }

  try {
    const stored = window.localStorage.getItem(storageKey)
    return stored ? (JSON.parse(stored) as T) : fallback
  } catch {
    return fallback
  }
}

function writeStoredValue<T>(storageKey: string, value: T) {
  if (!hasWindow()) {
    return
  }

  window.localStorage.setItem(storageKey, JSON.stringify(value))
}

function readStoredUsers(): LocalUser[] {
  return readStoredValue<LocalUser[]>(LOCAL_USERS_STORAGE_KEY, [])
}

function writeStoredUsers(users: LocalUser[]) {
  writeStoredValue(LOCAL_USERS_STORAGE_KEY, users)
}

function readStoredNgos(): LocalNgo[] {
  const fallback = localNgos.map((ngo) => normalizeNgo(ngo as Record<string, any>))
  const stored = readStoredValue<LocalNgo[]>(LOCAL_NGOS_STORAGE_KEY, [])

  const merged = new Map<string, LocalNgo>()
  for (const ngo of fallback) {
    merged.set(ngo.id, ngo)
  }
  for (const ngo of stored) {
    merged.set(ngo.id, normalizeNgo(ngo))
  }

  const normalized = Array.from(merged.values())

  if (hasWindow() && normalized.length !== stored.length) {
    writeStoredValue(LOCAL_NGOS_STORAGE_KEY, normalized)
  }

  return normalized
}

function writeStoredNgos(ngos: LocalNgo[]) {
  writeStoredValue(LOCAL_NGOS_STORAGE_KEY, ngos)
}

function readStoredDonations(): LocalDonation[] {
  return readStoredValue<LocalDonation[]>(LOCAL_DONATIONS_STORAGE_KEY, [])
}

function writeStoredDonations(donations: LocalDonation[]) {
  writeStoredValue(LOCAL_DONATIONS_STORAGE_KEY, donations)
}

function readLocalUsers(): LocalUser[] {
  return readStoredUsers()
}

function writeLocalUsers(users: LocalUser[]) {
  writeStoredUsers(users)
}

function readActiveUser(): Omit<LocalUser, 'password'> | null {
  if (!hasWindow()) {
    return null
  }

  try {
    const stored = window.localStorage.getItem(LOCAL_ACTIVE_USER_STORAGE_KEY)
    return stored ? (JSON.parse(stored) as Omit<LocalUser, 'password'>) : null
  } catch {
    return null
  }
}

function writeActiveUser(user: Omit<LocalUser, 'password'> | null) {
  if (!hasWindow()) {
    return
  }

  if (!user) {
    window.localStorage.removeItem(LOCAL_ACTIVE_USER_STORAGE_KEY)
    return
  }

  window.localStorage.setItem(LOCAL_ACTIVE_USER_STORAGE_KEY, JSON.stringify(user))
}

class ApiClient {
  private token: string | null = null

  setToken(token: string) {
    this.token = token
    if (hasWindow()) {
      window.localStorage.setItem('auth_token', token)
    }
  }

  getToken(): string | null {
    if (this.token) return this.token
    if (!hasWindow()) {
      return null
    }

    const stored = window.localStorage.getItem('auth_token')
    if (stored) {
      this.token = stored
      return stored
    }
    return null
  }

  clearToken() {
    this.token = null
    if (hasWindow()) {
      window.localStorage.removeItem('auth_token')
    }
    writeActiveUser(null)
  }

  private getStoredNgos(params?: {
    verified?: boolean
    limit?: number
    cause?: string
    state?: string
  }) {
    let fallback = readStoredNgos()

    if (params?.verified !== undefined) {
      fallback = fallback.filter((ngo) => ngo.verified === params.verified)
    }

    if (params?.cause && params.cause !== 'all') {
      fallback = fallback.filter((ngo) => ngo.cause === params.cause)
    }

    if (params?.state && params.state !== 'all') {
      fallback = fallback.filter((ngo) => ngo.state === params.state)
    }

    if (params?.limit) {
      fallback = fallback.slice(0, params.limit)
    }

    return { ngos: clone(fallback) }
  }

  // Auth endpoints
  async signup(email: string, password: string, name?: string, role?: string) {
    const users = readLocalUsers()
    const existingUser = users.find((user) => user.email.toLowerCase() === email.toLowerCase())

    if (existingUser) {
      throw new Error('User already exists')
    }

    const user: LocalUser = {
      id: crypto.randomUUID(),
      email,
      name,
      role: role || 'USER',
      password,
      followingNgoIds: [],
      recentSearchTerms: [],
    }

    users.push(user)
    writeLocalUsers(users)

    const activeUser = { ...user }
    delete (activeUser as Partial<LocalUser>).password
    writeActiveUser(activeUser)
    this.setToken(`local-${user.id}`)

    return {
      message: 'User created successfully',
      user: activeUser,
      token: `local-${user.id}`,
    }
  }

  async login(email: string, password: string) {
    const users = readLocalUsers()
    let user = users.find(
      (item) => item.email.toLowerCase() === email.toLowerCase() && item.password === password
    )

    if (!user) {
      user = {
        id: crypto.randomUUID(),
        email,
        name: email.split('@')[0],
        role: 'USER',
        password,
        followingNgoIds: [],
        recentSearchTerms: [],
      }

      users.push(user)
      writeLocalUsers(users)
    }

    const activeUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      followingNgoIds: user.followingNgoIds,
      recentSearchTerms: user.recentSearchTerms,
    }

    writeActiveUser(activeUser)
    this.setToken(`local-${user.id}`)

    return {
      message: 'Login successful',
      user: activeUser,
      token: `local-${user.id}`,
    }
  }

  async getCurrentUser() {
    const activeUser = readActiveUser()

    if (!activeUser) {
      throw new Error('Not authenticated')
    }

    return { user: activeUser }
  }

  async updateUser(id: string, data: any) {
    const users = readLocalUsers()
    const index = users.findIndex((user) => user.id === id)

    if (index === -1) {
      throw new Error('User not found')
    }

    const updatedUser = {
      ...users[index],
      ...data,
    }

    users[index] = updatedUser
    writeLocalUsers(users)

    const activeUser = readActiveUser()
    if (activeUser && activeUser.id === id) {
      writeActiveUser({
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        role: updatedUser.role,
        followingNgoIds: updatedUser.followingNgoIds,
        recentSearchTerms: updatedUser.recentSearchTerms,
      })
    }

    return {
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        role: updatedUser.role,
        followingNgoIds: updatedUser.followingNgoIds,
        recentSearchTerms: updatedUser.recentSearchTerms,
      },
    }
  }

  // NGO endpoints
  async getNgos(params?: {
    verified?: boolean
    limit?: number
    cause?: string
    state?: string
  }) {
    return this.getStoredNgos(params)
  }

  async getNgo(id: string) {
    const ngo = readStoredNgos().find((item) => item.id === id)

    if (!ngo) {
      throw new Error('NGO not found')
    }

    return { ngo: clone(ngo) }
  }

  async createNgo(ngoData: any) {
    const ngos = readStoredNgos()
    const now = new Date().toISOString()
    const ngo = normalizeNgo({
      ...ngoData,
      id: ngoData.id ?? crypto.randomUUID(),
      verified: ngoData.verified ?? false,
      createdAt: ngoData.createdAt ?? now,
      updatedAt: now,
      members: ngoData.members ?? {},
      posts: ngoData.posts ?? [],
      needs: ngoData.needs ?? [],
    })

    ngos.unshift(ngo)
    writeStoredNgos(ngos)

    return { ngo: clone(ngo) }
  }

  async updateNgo(id: string, ngoData: any) {
    const ngos = readStoredNgos()
    const index = ngos.findIndex((ngo) => ngo.id === id)

    if (index === -1) {
      throw new Error('NGO not found')
    }

    const updatedNgo = normalizeNgo({
      ...ngos[index],
      ...ngoData,
      updatedAt: new Date().toISOString(),
    })

    ngos[index] = updatedNgo
    writeStoredNgos(ngos)

    return { ngo: clone(updatedNgo) }
  }

  async deleteNgo(id: string) {
    const ngos = readStoredNgos().filter((ngo) => ngo.id !== id)
    const donations = readStoredDonations().filter((donation) => donation.ngoId !== id)

    writeStoredNgos(ngos)
    writeStoredDonations(donations)

    return { success: true }
  }

  // Donation endpoints
  async getDonations(params?: { userId?: string; ngoId?: string; limit?: number }) {
    let donations = readStoredDonations()

    if (params?.userId) {
      donations = donations.filter((donation) => donation.userId === params.userId)
    }

    if (params?.ngoId) {
      donations = donations.filter((donation) => donation.ngoId === params.ngoId)
    }

    donations = donations.sort(
      (left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime()
    )

    if (params?.limit) {
      donations = donations.slice(0, params.limit)
    }

    return { donations: clone(donations) }
  }

  async createDonation(amount: number, userId: string, ngoId: string) {
    const ngos = readStoredNgos()
    const ngoIndex = ngos.findIndex((item) => item.id === ngoId)

    if (ngoIndex === -1) {
      throw new Error('NGO not found')
    }

    const users = readLocalUsers()
    const user = users.find((item) => item.id === userId) || readActiveUser()
    const ngo = ngos[ngoIndex]
    const donation: LocalDonation = {
      id: crypto.randomUUID(),
      amount,
      userId,
      userName: user?.name || user?.email || 'Anonymous',
      ngoId,
      ngoName: ngo.name,
      cause: ngo.cause,
      createdAt: new Date().toISOString(),
    }

    const donations = readStoredDonations()
    donations.unshift(donation)
    writeStoredDonations(donations)

    ngos[ngoIndex] = {
      ...ngo,
      raisedAmount: (ngo.raisedAmount || 0) + amount,
      updatedAt: new Date().toISOString(),
    }
    writeStoredNgos(ngos)

    return { donation: clone(donation) }
  }
}

export const apiClient = new ApiClient()
export default apiClient
