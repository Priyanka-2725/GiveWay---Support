import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export class UserService {
  static async getUserById(id: string) {
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        ngoMemberships: true,
        donations: true,
        volunteerRequests: true,
      },
    })

    if (!user) throw new Error('User not found')
    const { passwordHash, ...sanitized } = user
    return sanitized
  }

  static async updateUser(id: string, data: any) {
    const allowedFields = ['name', 'email', 'followingNgoIds', 'recentSearchTerms']
    const updateData: any = {}

    for (const field of allowedFields) {
      if (field in data) {
        updateData[field] = data[field]
      }
    }

    const user = await prisma.user.update({
      where: { id },
      data: updateData,
    })

    const { passwordHash, ...sanitized } = user
    return sanitized
  }

  static async followNgo(userId: string, ngoId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user) throw new Error('User not found')

    const ngo = await prisma.ngo.findUnique({ where: { id: ngoId } })
    if (!ngo) throw new Error('NGO not found')

    const followingNgoIds = user.followingNgoIds || []
    if (!followingNgoIds.includes(ngoId)) {
      followingNgoIds.push(ngoId)
    }

    await prisma.user.update({
      where: { id: userId },
      data: { followingNgoIds },
    })

    return { message: 'Successfully followed NGO' }
  }

  static async unfollowNgo(userId: string, ngoId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user) throw new Error('User not found')

    const followingNgoIds = (user.followingNgoIds || []).filter(id => id !== ngoId)

    await prisma.user.update({
      where: { id: userId },
      data: { followingNgoIds },
    })

    return { message: 'Successfully unfollowed NGO' }
  }
}
