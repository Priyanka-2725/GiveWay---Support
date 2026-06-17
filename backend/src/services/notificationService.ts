import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export class NotificationService {
  static async getNotifications(userId: string) {
    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    })

    return notifications
  }

  static async markAsRead(id: string, userId: string) {
    const notification = await prisma.notification.findUnique({ where: { id } })

    if (!notification || notification.userId !== userId) {
      throw new Error('Unauthorized')
    }

    const updated = await prisma.notification.update({
      where: { id },
      data: { read: true },
    })

    return updated
  }

  static async markAllAsRead(userId: string) {
    const result = await prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true },
    })

    return result
  }
}
