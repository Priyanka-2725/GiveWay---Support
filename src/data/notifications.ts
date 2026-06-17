import { Notification } from '@/types'

export const mockNotifications: Notification[] = [
  {
    id: "notif_001",
    userId: "user_regular",
    message: "Thank you for your generous donation of ₹1,500 to Educate for All!",
    read: false,
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "notif_002",
    userId: "user_regular",
    message: "Your volunteer request for Educate for All has been received.",
    read: true,
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "notif_003",
    userId: "user_superadmin",
    message: "Your volunteer application for Green Planet Initiative has been accepted! See you at the next drive.",
    read: false,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  }
]
