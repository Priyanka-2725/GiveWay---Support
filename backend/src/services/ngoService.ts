import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export class NgoService {
  static async getAllNgos(params?: { verified?: boolean; limit?: number; cause?: string; state?: string }) {
    const where: any = {}

    if (params?.verified !== undefined) {
      where.verified = params.verified
    }
    if (params?.cause) {
      where.cause = params.cause
    }
    if (params?.state) {
      where.state = params.state
    }

    const ngos = await prisma.ngo.findMany({
      where,
      take: params?.limit || 50,
      include: {
        members: true,
        posts: { take: 5 },
        needs: { take: 5 },
      },
    })

    return ngos
  }

  static async getNgoById(id: string) {
    const ngo = await prisma.ngo.findUnique({
      where: { id },
      include: {
        members: true,
        posts: true,
        needs: true,
        donations: true,
      },
    })

    if (!ngo) throw new Error('NGO not found')
    return ngo
  }

  static async createNgo(data: any, userId: string) {
    const ngo = await prisma.ngo.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        website: data.website,
        cause: data.cause,
        state: data.state,
        city: data.city,
        registrationNumber: data.registrationNumber,
        description: data.description,
        logo: data.logo,
        verified: false,
      },
    })

    // Add creator as owner
    await prisma.ngoMember.create({
      data: {
        ngoId: ngo.id,
        userId,
        role: 'owner',
      },
    })

    return ngo
  }

  static async updateNgo(id: string, data: any, userId: string) {
    // Check if user is member
    const member = await prisma.ngoMember.findFirst({
      where: { ngoId: id, userId },
    })

    if (!member) {
      throw new Error('Unauthorized')
    }

    const allowedFields = ['name', 'description', 'logo', 'website', 'email', 'phone']
    const updateData: any = {}

    for (const field of allowedFields) {
      if (field in data) {
        updateData[field] = data[field]
      }
    }

    const ngo = await prisma.ngo.update({
      where: { id },
      data: updateData,
    })

    return ngo
  }

  static async deleteNgo(id: string, userId: string) {
    const member = await prisma.ngoMember.findFirst({
      where: { ngoId: id, userId, role: 'owner' },
    })

    if (!member) {
      throw new Error('Only owner can delete NGO')
    }

    await prisma.ngo.delete({ where: { id } })
    return { message: 'NGO deleted' }
  }
}
