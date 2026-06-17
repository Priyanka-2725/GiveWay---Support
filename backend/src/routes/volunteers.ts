import { Router, Request, Response } from 'express'
import { body, validationResult } from 'express-validator'
import { authenticateToken, optionalAuth } from '../middleware/auth'
import { VolunteerService } from '../services/volunteerService'
import { CustomRequest } from '../middleware/errorHandler'

const router = Router()

// Get volunteer requests
router.get('/', optionalAuth, async (req: CustomRequest, res: Response) => {
  try {
    const volunteerRequests = await VolunteerService.getVolunteerRequests({
      ngoId: req.query.ngoId as string,
      userId: req.query.userId as string,
    })
    res.json({ volunteerRequests })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
})

// Create volunteer request
router.post(
  '/:ngoId',
  authenticateToken,
  [
    body('skillsOffered').optional().isArray(),
    body('hoursPerWeek').optional().isInt({ min: 0 }),
  ],
  async (req: CustomRequest, res: Response) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    try {
      const volunteerRequest = await VolunteerService.createVolunteerRequest(
        req.params.ngoId,
        req.userId!,
        req.body
      )
      res.status(201).json({ volunteerRequest })
    } catch (error: any) {
      res.status(error.message.includes('not found') ? 404 : 400).json({ message: error.message })
    }
  }
)

// Update volunteer request status
router.patch(
  '/:id/status',
  authenticateToken,
  [body('status').isIn(['accepted', 'rejected'])],
  async (req: CustomRequest, res: Response) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    try {
      const volunteerRequest = await VolunteerService.updateVolunteerRequestStatus(
        req.params.id,
        req.body.status,
        req.userId!
      )
      res.json({ volunteerRequest })
    } catch (error: any) {
      res.status(error.message === 'Unauthorized' ? 403 : 500).json({ message: error.message })
    }
  }
)

export default router
