import { Router, Request, Response } from 'express'
import { authenticateToken } from '../middleware/auth'
import { PrismaClient } from '@prisma/client'
import { CustomRequest } from '../middleware/errorHandler'

const router = Router()
const prisma = new PrismaClient()

// Get user's feed
router.get('/my', authenticateToken, async (req: CustomRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: { followingNgoIds: true },
    })

    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    // Get donations and posts from followed NGOs
    const donations = await prisma.donation.findMany({
      where: { ngoId: { in: user.followingNgoIds || [] } },
      include: { user: true, ngo: true },
      orderBy: { createdAt: 'desc' },
      take: 20,
    })

    const posts = await prisma.ngoPost.findMany({
      where: { ngoId: { in: user.followingNgoIds || [] } },
      include: { ngo: true },
      orderBy: { createdAt: 'desc' },
      take: 20,
    })

    const feedItems = [
      ...donations.map(d => ({
        id: d.id,
        type: 'donation',
        title: `${d.user.name} donated ₹${d.amount}`,
        message: d.message,
        ngo: d.ngo,
        createdAt: d.createdAt,
      })),
      ...posts.map(p => ({
        id: p.id,
        type: 'post',
        title: p.title,
        message: p.content,
        ngo: p.ngo,
        createdAt: p.createdAt,
      })),
    ].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())

    res.json({ feedItems })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
})

export default router
