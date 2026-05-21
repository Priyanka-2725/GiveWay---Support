export type FeedType =
  | "donation"
  | "volunteer"
  | "ngo_update"
  | "recommendation"
  | "milestone"

export type FeedSection =
  | "for-you"
  | "recent-activity"
  | "recommendations"
  | "urgent-causes"

export type FeedItem = {
  id: number
  type: FeedType
  title: string
  message: string
  ngo: string
  createdAt: string
  read: boolean
}

export const feedData: FeedItem[] = [
  {
    id: 1,
    type: "donation",
    title: "Donation Successful",
    message: "You donated ₹500 to Hope Foundation",
    ngo: "Hope Foundation",
    createdAt: "2026-05-21T09:10:00.000Z",
    read: false,
  },
  {
    id: 2,
    type: "volunteer",
    title: "Volunteer Request Approved",
    message: "Smile Foundation approved your request for the weekend drive",
    ngo: "Smile Foundation",
    createdAt: "2026-05-21T08:20:00.000Z",
    read: true,
  },
  {
    id: 3,
    type: "ngo_update",
    title: "Impact Update Published",
    message: "Green Planet Initiative shared a new reforestation progress update",
    ngo: "Green Planet Initiative",
    createdAt: "2026-05-21T07:05:00.000Z",
    read: false,
  },
  {
    id: 4,
    type: "milestone",
    title: "Milestone Reached",
    message: "Educate for All crossed 50% of its fundraising goal",
    ngo: "Educate for All",
    createdAt: "2026-05-21T06:10:00.000Z",
    read: false,
  },
  {
    id: 5,
    type: "recommendation",
    title: "Recommended Cause",
    message: "HealthBridge matches your interests in healthcare support",
    ngo: "HealthBridge",
    createdAt: "2026-05-21T05:35:00.000Z",
    read: true,
  },
  {
    id: 6,
    type: "donation",
    title: "Donation Received",
    message: "Your contribution helped Safe Haven Animal Rescue",
    ngo: "Safe Haven Animal Rescue",
    createdAt: "2026-05-20T19:00:00.000Z",
    read: true,
  },
  {
    id: 7,
    type: "ngo_update",
    title: "Urgent Supply Drive",
    message: "Goonj is collecting winter essentials for disaster relief zones",
    ngo: "Goonj",
    createdAt: "2026-05-20T16:30:00.000Z",
    read: false,
  },
  {
    id: 8,
    type: "volunteer",
    title: "Volunteer Shift Confirmed",
    message: "Child Rights and You confirmed your Sunday community session",
    ngo: "Child Rights and You (CRY)",
    createdAt: "2026-05-20T13:45:00.000Z",
    read: true,
  },
  {
    id: 9,
    type: "milestone",
    title: "Goal Progress Alert",
    message: "The Empowerment Project reached 60% of its annual target",
    ngo: "The Empowerment Project",
    createdAt: "2026-05-20T11:20:00.000Z",
    read: false,
  },
  {
    id: 10,
    type: "recommendation",
    title: "New Recommendation",
    message: "HelpAge India is a high-impact match based on your recent activity",
    ngo: "HelpAge India",
    createdAt: "2026-05-20T08:05:00.000Z",
    read: false,
  },
  {
    id: 11,
    type: "ngo_update",
    title: "Verified NGO Spotlight",
    message: "GiveIndia Foundation posted a new transparency report",
    ngo: "GiveIndia Foundation",
    createdAt: "2026-05-19T18:40:00.000Z",
    read: true,
  },
  {
    id: 12,
    type: "donation",
    title: "Donation Match Complete",
    message: "Your ₹1,000 donation triggered a matching contribution from a partner",
    ngo: "HealthBridge",
    createdAt: "2026-05-19T14:15:00.000Z",
    read: false,
  },
]

export const feedTabs: Array<{
  id: FeedSection
  label: string
  description: string
}> = [
  {
    id: "for-you",
    label: "For You",
    description: "Your latest personalized impact activity",
  },
  {
    id: "recent-activity",
    label: "Recent Activity",
    description: "All recent donation and NGO events",
  },
  {
    id: "recommendations",
    label: "Recommendations",
    description: "Suggested NGOs based on your activity",
  },
  {
    id: "urgent-causes",
    label: "Urgent Causes",
    description: "High-priority updates and milestones",
  },
]

export const feedTypeOptions: Array<{
  id: FeedType | "all"
  label: string
}> = [
  { id: "all", label: "All" },
  { id: "donation", label: "Donations" },
  { id: "volunteer", label: "Volunteers" },
  { id: "ngo_update", label: "NGO Updates" },
  { id: "milestone", label: "Milestones" },
  { id: "recommendation", label: "Recommendations" },
]
