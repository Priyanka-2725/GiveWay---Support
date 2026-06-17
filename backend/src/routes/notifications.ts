import { Router, Request, Response } from 'express'
import { authenticateToken } from '../middleware/auth'
import { NotificationService } from '../services/notificationService'
import { CustomRequest } from '../middleware/errorHandler'

const router = Router()

// Get notifications
router.get('/:userId', authenticateToken, async (req: CustomRequest, res: Response) => {
  try {
    if (req.params.userId !== req.userId) {
      return res.status(403).json({ message: 'Unauthorized' })
    }

    const notifications = await NotificationService.getNotifications(req.params.userId)
    res.json({ notifications })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
})

// Mark notification as read
router.patch('/:id/read', authenticateToken, async (req: CustomRequest, res: Response) => {
  try {
    const notification = await NotificationService.markAsRead(req.params.id, req.userId!)
    res.json({ notification })
  } catch (error: any) {
    res.status(error.message === 'Unauthorized' ? 403 : 500).json({ message: error.message })
  }
})

// Mark all as read
router.patch('/all/read', authenticateToken, async (req: CustomRequest, res: Response) => {
  try {
    const result = await NotificationService.markAllAsRead(req.userId!)
    res.json(result)
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
})

export default router
