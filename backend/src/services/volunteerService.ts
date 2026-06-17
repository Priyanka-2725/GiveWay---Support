import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export class VolunteerService {
  static async getVolunteerRequests(params?: { ngoId?: string; userId?: string }) {
    const where: any = {}

    if (params?.ngoId) {
      where.ngoId = params.ngoId
    }
    if (params?.userId) {
      where.userId = params.userId
    }

    const requests = await prisma.volunteerRequest.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, email: true } },
        ngo: { select: { id: true, name: true, logo: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    return requests
  }

  static async createVolunteerRequest(ngoId: string, userId: string, data: any) {
    const ngo = await prisma.ngo.findUnique({ where: { id: ngoId } })
    if (!ngo) throw new Error('NGO not found')

    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user) throw new Error('User not found')

    const request = await prisma.volunteerRequest.create({
      data: {
        ngoId,
        userId,
        skillsOffered: data.skillsOffered || [],
        hoursPerWeek: data.hoursPerWeek || 0,
        message: data.message || '',
        status: 'pending',
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
        ngo: { select: { id: true, name: true, logo: true } },
      },
    })

    // Notify NGO members
    const members = await prisma.ngoMember.findMany({ where: { ngoId } })
    for (const member of members) {
      await prisma.notification.create({
        data: {
          userId: member.userId,
          title: `New volunteer application from ${user.name}`,
          message: `${user.name} wants to volunteer for ${ngo.name}`,
          type: 'volunteer',
          read: false,
        },
      })
    }

    return request
  }

  static async updateVolunteerRequestStatus(id: string, status: 'accepted' | 'rejected', userId: string) {
    const request = await prisma.volunteerRequest.findUnique({
      where: { id },
      include: { ngo: true },
    })

    if (!request) throw new Error('Request not found')

    // Check if user is NGO member
    const member = await prisma.ngoMember.findFirst({
      where: { ngoId: request.ngoId, userId },
    })

    if (!member) throw new Error('Unauthorized')

    const updated = await prisma.volunteerRequest.update({
      where: { id },
      data: { status },
      include: {
        user: { select: { id: true, name: true, email: true } },
        ngo: { select: { id: true, name: true, logo: true } },
      },
    })

    // Notify volunteer
    await prisma.notification.create({
      data: {
        userId: request.userId,
        title: `Your volunteer application was ${status}`,
        message: `Your application for ${request.ngo.name} was ${status}`,
        type: 'volunteer',
        read: false,
      },
    })

    return updated
  }
}
