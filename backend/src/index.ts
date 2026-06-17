import express, { Express, Request, Response, NextFunction } from 'express'
import cors from 'cors'
import morgan from 'morgan'
import dotenv from 'dotenv'

import authRoutes from './routes/auth'
import userRoutes from './routes/users'
import ngoRoutes from './routes/ngos'
import donationRoutes from './routes/donations'
import volunteerRoutes from './routes/volunteers'
import notificationRoutes from './routes/notifications'
import feedRoutes from './routes/feed'
import { errorHandler } from './middleware/errorHandler'

dotenv.config()

const app: Express = express()
const port = process.env.PORT || 4000

// Middleware
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cors({
  origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'],
  credentials: true,
}))
app.use(morgan('combined'))

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() })
})

// API Routes
app.use('/api/auth', authRoutes)
app.use('/api/users', userRoutes)
app.use('/api/ngos', ngoRoutes)
app.use('/api/donations', donationRoutes)
app.use('/api/volunteers', volunteerRoutes)
app.use('/api/notifications', notificationRoutes)
app.use('/api/feed', feedRoutes)

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ message: 'Route not found' })
})

// Error handler (must be last)
app.use(errorHandler)

// Start server
app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`)
  console.log(`Environment: ${process.env.NODE_ENV}`)
})
