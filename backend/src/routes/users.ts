import { Router, Request, Response } from 'express'
import { authenticateToken } from '../middleware/auth'
import { UserService } from '../services/userService'
import { CustomRequest } from '../middleware/errorHandler'

const router = Router()

// Get user by ID
router.get('/:id', authenticateToken, async (req: CustomRequest, res: Response) => {
  try {
    const user = await UserService.getUserById(req.params.id)
    res.json({ user })
  } catch (error: any) {
    res.status(error.message === 'User not found' ? 404 : 500).json({ message: error.message })
  }
})

// Update user
router.patch('/:id', authenticateToken, async (req: CustomRequest, res: Response) => {
  try {
    if (req.params.id !== req.userId) {
      return res.status(403).json({ message: 'Unauthorized' })
    }

    const user = await UserService.updateUser(req.params.id, req.body)
    res.json({ user })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
})

// Follow NGO
router.post('/:userId/follow/:ngoId', authenticateToken, async (req: CustomRequest, res: Response) => {
  try {
    if (req.params.userId !== req.userId) {
      return res.status(403).json({ message: 'Unauthorized' })
    }

    const result = await UserService.followNgo(req.params.userId, req.params.ngoId)
    res.json(result)
  } catch (error: any) {
    res.status(error.message.includes('not found') ? 404 : 500).json({ message: error.message })
  }
})

// Unfollow NGO
router.post('/:userId/unfollow/:ngoId', authenticateToken, async (req: CustomRequest, res: Response) => {
  try {
    if (req.params.userId !== req.userId) {
      return res.status(403).json({ message: 'Unauthorized' })
    }

    const result = await UserService.unfollowNgo(req.params.userId, req.params.ngoId)
    res.json(result)
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
})

export default router
