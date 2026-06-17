import { Router, Request, Response } from 'express'
import { body, validationResult } from 'express-validator'
import { authenticateToken, optionalAuth } from '../middleware/auth'
import { NgoService } from '../services/ngoService'
import { CustomRequest } from '../middleware/errorHandler'

const router = Router()

// Get all NGOs
router.get('/', optionalAuth, async (req: CustomRequest, res: Response) => {
  try {
    const ngos = await NgoService.getAllNgos({
      verified: req.query.verified === 'true',
      limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
      cause: req.query.cause as string,
      state: req.query.state as string,
    })
    res.json({ ngos })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
})

// Get NGO by ID
router.get('/:id', optionalAuth, async (req: CustomRequest, res: Response) => {
  try {
    const ngo = await NgoService.getNgoById(req.params.id)
    res.json({ ngo })
  } catch (error: any) {
    res.status(error.message === 'NGO not found' ? 404 : 500).json({ message: error.message })
  }
})

// Create NGO
router.post(
  '/',
  authenticateToken,
  [
    body('name').notEmpty(),
    body('email').isEmail().normalizeEmail(),
  ],
  async (req: CustomRequest, res: Response) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    try {
      const ngo = await NgoService.createNgo(req.body, req.userId!)
      res.status(201).json({ ngo })
    } catch (error: any) {
      res.status(400).json({ message: error.message })
    }
  }
)

// Update NGO
router.patch('/:id', authenticateToken, async (req: CustomRequest, res: Response) => {
  try {
    const ngo = await NgoService.updateNgo(req.params.id, req.body, req.userId!)
    res.json({ ngo })
  } catch (error: any) {
    res.status(error.message === 'Unauthorized' ? 403 : 500).json({ message: error.message })
  }
})

// Delete NGO
router.delete('/:id', authenticateToken, async (req: CustomRequest, res: Response) => {
  try {
    const result = await NgoService.deleteNgo(req.params.id, req.userId!)
    res.json(result)
  } catch (error: any) {
    res.status(error.message.includes('Unauthorized') ? 403 : 500).json({ message: error.message })
  }
})

export default router
