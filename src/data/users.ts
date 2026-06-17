export type LocalUser = {
  id: string
  email: string
  name?: string
  role: 'user' | 'ngo_admin' | 'admin' | 'superadmin'
  password: string
  followingNgoIds?: string[]
  recentSearchTerms?: string[]
  userType?: 'donor' | 'ngo'
  createdAt?: string
  emailVerified?: boolean
}

export const mockUsers: LocalUser[] = [
  {
    id: "user_superadmin",
    email: "superadmin@giveway.org",
    name: "Priyanka Singh",
    role: "superadmin",
    password: "password123",
    followingNgoIds: ["ngo_001", "ngo_002"],
    recentSearchTerms: ["education", "environment"],
    userType: "donor",
    createdAt: new Date().toISOString(),
    emailVerified: true
  },
  {
    id: "user_admin",
    email: "admin@giveway.org",
    name: "Admin User",
    role: "admin",
    password: "password123",
    followingNgoIds: [],
    recentSearchTerms: [],
    userType: "donor",
    createdAt: new Date().toISOString(),
    emailVerified: true
  },
  {
    id: "user_ngo_admin",
    email: "ngo@giveway.org",
    name: "NGO Administrator",
    role: "ngo_admin",
    password: "password123",
    followingNgoIds: [],
    recentSearchTerms: [],
    userType: "ngo",
    createdAt: new Date().toISOString(),
    emailVerified: true
  },
  {
    id: "user_regular",
    email: "user@giveway.org",
    name: "Regular Donor",
    role: "user",
    password: "password123",
    followingNgoIds: ["ngo_001"],
    recentSearchTerms: ["child care"],
    userType: "donor",
    createdAt: new Date().toISOString(),
    emailVerified: true
  }
]
