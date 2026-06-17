export type LocalDonation = {
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

export const mockDonations: LocalDonation[] = [
  {
    id: "don_001",
    amount: 1500,
    userId: "user_regular",
    userName: "Regular Donor",
    ngoId: "ngo_001",
    ngoName: "Educate for All",
    cause: "Education",
    message: "Keep up the great work!",
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() // 5 days ago
  },
  {
    id: "don_002",
    amount: 5000,
    userId: "user_regular",
    userName: "Regular Donor",
    ngoId: "ngo_002",
    ngoName: "Green Planet Initiative",
    cause: "Environment",
    message: "Supporting reforestation.",
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() // 3 days ago
  },
  {
    id: "don_003",
    amount: 2500,
    userId: "user_superadmin",
    userName: "Priyanka Singh",
    ngoId: "ngo_003",
    ngoName: "HealthBridge",
    cause: "Healthcare",
    message: "For mobile clinics.",
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() // 1 day ago
  }
]
