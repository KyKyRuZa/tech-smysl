import 'server-only'
import { logger } from '@/lib/logger'

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public isOperational: boolean = true
  ) {
    super(message)
    Object.setPrototypeOf(this, AppError.prototype)
  }
}

export class BadRequestError extends AppError {
  constructor(message: string = 'Bad request') {
    super(400, message)
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized') {
    super(401, message)
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = 'Forbidden') {
    super(403, message)
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Not found') {
    super(404, message)
  }
}

export class ConflictError extends AppError {
  constructor(message: string = 'Conflict') {
    super(409, message)
  }
}

export class InternalServerError extends AppError {
  constructor(message: string = 'Internal server error') {
    super(500, message)
  }
}

export function handleRouteError(error: unknown) {
  if (error instanceof AppError) {
    logger.error('Route error', { statusCode: error.statusCode, message: error.message })
    return new Response(JSON.stringify({ error: error.message }), {
      status: error.statusCode,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  if (error instanceof Error) {
    logger.error('Unexpected route error', { message: error.message, stack: error.stack })
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  logger.error('Unknown route error')
  return new Response(JSON.stringify({ error: 'Internal server error' }), {
    status: 500,
    headers: { 'Content-Type': 'application/json' },
  })
}
