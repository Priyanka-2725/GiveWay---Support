import { VolunteerRequest } from '@/types'

export const mockVolunteerRequests: VolunteerRequest[] = [
  {
    id: "vol_001",
    ngoId: "ngo_001",
    ngoName: "Educate for All",
    userId: "user_regular",
    userName: "Regular Donor",
    userEmail: "user@giveway.org",
    skills: "Teaching, Mentoring",
    availability: "Weekends, 4 hours/week",
    message: "I would love to help teach English or Math to kids.",
    status: "pending",
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "vol_002",
    ngoId: "ngo_002",
    ngoName: "Green Planet Initiative",
    userId: "user_superadmin",
    userName: "Priyanka Singh",
    userEmail: "superadmin@giveway.org",
    skills: "Event organizing, photography",
    availability: "Flexible",
    message: "Interested in tree plantation drives.",
    status: "accepted",
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  }
]
