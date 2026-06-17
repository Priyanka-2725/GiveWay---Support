import { Request, Response, NextFunction } from 'express'

export interface CustomRequest extends Request {
  userId?: string
  user?: any
}

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('Error:', err)

  const status = err.status || 500
  const message = err.message || 'Internal server error'

  res.status(status).json({
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  })
}

export class AppError extends Error {
  constructor(public message: string, public status: number) {
    super(message)
    Error.captureStackTrace(this, this.constructor)
  }
}
