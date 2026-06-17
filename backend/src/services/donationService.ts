import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export class DonationService {
  static async getAllDonations(params?: { userId?: string; ngoId?: string; limit?: number }) {
    const where: any = {}

    if (params?.userId) {
      where.userId = params.userId
    }
    if (params?.ngoId) {
      where.ngoId = params.ngoId
    }

    const donations = await prisma.donation.findMany({
      where,
      take: params?.limit || 50,
      include: {
        user: { select: { id: true, name: true, email: true } },
        ngo: { select: { id: true, name: true, logo: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    return donations
  }

  static async createDonation(userId: string, ngoId: string, amount: number, message?: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user) throw new Error('User not found')

    const ngo = await prisma.ngo.findUnique({ where: { id: ngoId } })
    if (!ngo) throw new Error('NGO not found')

    const donation = await prisma.donation.create({
      data: {
        amount,
        message: message || '',
        userId,
        ngoId,
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
        ngo: { select: { id: true, name: true, logo: true } },
      },
    })

    // Create notification for NGO
    const members = await prisma.ngoMember.findMany({ where: { ngoId } })
    for (const member of members) {
      await prisma.notification.create({
        data: {
          userId: member.userId,
          title: `New donation from ${user.name}`,
          message: `Received ₹${amount} from ${user.name}`,
          type: 'donation',
          read: false,
        },
      })
    }

    return donation
  }
}
