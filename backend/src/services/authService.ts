import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export class AuthService {
  static async register(email: string, password: string, name: string, role: string = 'user') {
    // Check if user exists
    const existingUser = await prisma.user.findUnique({ where: { email } })
    if (existingUser) {
      throw new Error('User already exists')
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        name,
        passwordHash: hashedPassword,
        role: role as any,
      },
    })

    // Generate token
    const token = this.generateToken(user.id, user.role)

    return { token, user: this.sanitizeUser(user) }
  }

  static async login(email: string, password: string) {
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      throw new Error('Invalid email or password')
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash)
    if (!isPasswordValid) {
      throw new Error('Invalid email or password')
    }

    const token = this.generateToken(user.id, user.role)

    return { token, user: this.sanitizeUser(user) }
  }

  static generateToken(userId: string, role: string) {
    const secret = process.env.JWT_SECRET || 'secret'
    const expiresIn = process.env.JWT_EXPIRES_IN || '7d'

    return jwt.sign(
      { id: userId, role },
      secret,
      { expiresIn }
    )
  }

  static sanitizeUser(user: any) {
    const { passwordHash, ...sanitized } = user
    return sanitized
  }
}
