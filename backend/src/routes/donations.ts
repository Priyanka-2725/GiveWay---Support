import { Router, Request, Response } from 'express'
import { body, validationResult } from 'express-validator'
import { authenticateToken, optionalAuth } from '../middleware/auth'
import { DonationService } from '../services/donationService'
import { CustomRequest } from '../middleware/errorHandler'

const router = Router()

// Get all donations
router.get('/', optionalAuth, async (req: CustomRequest, res: Response) => {
  try {
    const donations = await DonationService.getAllDonations({
      userId: req.query.userId as string,
      ngoId: req.query.ngoId as string,
      limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
    })
    res.json({ donations })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
})

// Create donation
router.post(
  '/',
  authenticateToken,
  [
    body('amount').isInt({ min: 1 }),
    body('ngoId').notEmpty(),
  ],
  async (req: CustomRequest, res: Response) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    try {
      const { amount, ngoId, message } = req.body
      const donation = await DonationService.createDonation(
        req.userId!,
        ngoId,
        amount,
        message
      )
      res.status(201).json({ donation })
    } catch (error: any) {
      res.status(400).json({ message: error.message })
    }
  }
)

export default router
