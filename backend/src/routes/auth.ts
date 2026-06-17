import { Router, Request, Response } from 'express'
import { body, validationResult } from 'express-validator'
import { AuthService } from '../services/authService'
import { AppError } from '../middleware/errorHandler'
import { authenticateToken } from '../middleware/auth'
import { CustomRequest } from '../middleware/errorHandler'
import { PrismaClient } from '@prisma/client'

const router = Router()
const prisma = new PrismaClient()

// Register
router.post(
  '/register',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 6 }),
    body('name').notEmpty(),
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    try {
      const { email, password, name, role } = req.body
      const result = await AuthService.register(email, password, name, role)
      res.json({ token: result.token, user: result.user, message: 'Registration successful' })
    } catch (error: any) {
      res.status(400).json({ message: error.message })
    }
  }
)

// Login
router.post(
  '/login',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty(),
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    try {
      const { email, password } = req.body
      const result = await AuthService.login(email, password)
      res.json({ token: result.token, user: result.user, message: 'Login successful' })
    } catch (error: any) {
      res.status(401).json({ message: error.message })
    }
  }
)

// Logout
router.post('/logout', authenticateToken, (req: Request, res: Response) => {
  res.json({ message: 'Logout successful', success: true })
})

// Get current user
router.get('/me', authenticateToken, async (req: CustomRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        emailVerified: true,
        followingNgoIds: true,
        createdAt: true,
      },
    })

    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    res.json({ user })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
})

// Forgot password
router.post(
  '/forgot-password',
  [body('email').isEmail().normalizeEmail()],
  async (req: Request, res: Response) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    try {
      const { email } = req.body
      const user = await prisma.user.findUnique({ where: { email } })

      if (!user) {
        return res.status(404).json({ message: 'User not found' })
      }

      // TODO: Send email with reset token
      res.json({ message: 'Password reset email sent (feature not yet implemented)' })
    } catch (error: any) {
      res.status(500).json({ message: error.message })
    }
  }
)

// Reset password
router.post(
  '/reset-password',
  [
    body('token').notEmpty(),
    body('password').isLength({ min: 6 }),
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    try {
      // TODO: Verify reset token
      res.json({ message: 'Password reset (feature not yet implemented)' })
    } catch (error: any) {
      res.status(500).json({ message: error.message })
    }
  }
)

// Verify email
router.post(
  '/verify-email',
  [body('token').notEmpty()],
  async (req: Request, res: Response) => {
    try {
      // TODO: Verify email token
      res.json({ message: 'Email verified (feature not yet implemented)', user: {} })
    } catch (error: any) {
      res.status(500).json({ message: error.message })
    }
  }
)

export default router
