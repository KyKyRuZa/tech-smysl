import { describe, it, expect, vi } from 'vitest'
import { AppError, BadRequestError, UnauthorizedError, ForbiddenError, NotFoundError, ConflictError, InternalServerError, handleRouteError } from '@/lib/errors'

describe('errors', () => {
  it('AppError sets statusCode and message', () => {
    const error = new AppError(400, 'Bad request')
    expect(error.statusCode).toBe(400)
    expect(error.message).toBe('Bad request')
    expect(error.isOperational).toBe(true)
    expect(error).toBeInstanceOf(Error)
  })

  it('BadRequestError defaults to 400', () => {
    const error = new BadRequestError()
    expect(error.statusCode).toBe(400)
    expect(error.message).toBe('Bad request')
  })

  it('UnauthorizedError defaults to 401', () => {
    const error = new UnauthorizedError()
    expect(error.statusCode).toBe(401)
    expect(error.message).toBe('Unauthorized')
  })

  it('ForbiddenError defaults to 403', () => {
    const error = new ForbiddenError()
    expect(error.statusCode).toBe(403)
    expect(error.message).toBe('Forbidden')
  })

  it('NotFoundError defaults to 404', () => {
    const error = new NotFoundError()
    expect(error.statusCode).toBe(404)
    expect(error.message).toBe('Not found')
  })

  it('ConflictError defaults to 409', () => {
    const error = new ConflictError()
    expect(error.statusCode).toBe(409)
    expect(error.message).toBe('Conflict')
  })

  it('InternalServerError defaults to 500', () => {
    const error = new InternalServerError()
    expect(error.statusCode).toBe(500)
    expect(error.message).toBe('Internal server error')
  })

  it('handleRouteError returns AppError response', async () => {
    const loggerSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
    const error = new NotFoundError('Item not found')
    const response = handleRouteError(error)
    expect(response.status).toBe(404)
    const json = await response.json()
    expect(json.error).toBe('Item not found')
    loggerSpy.mockRestore()
  })

  it('handleRouteError returns generic Error response', async () => {
    const loggerSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
    const error = new Error('Unexpected')
    const response = handleRouteError(error)
    expect(response.status).toBe(500)
    const json = await response.json()
    expect(json.error).toBe('Unexpected')
    loggerSpy.mockRestore()
  })

  it('handleRouteError returns 500 for unknown error', async () => {
    const loggerSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
    const response = handleRouteError('string error')
    expect(response.status).toBe(500)
    const json = await response.json()
    expect(json.error).toBe('Internal server error')
    loggerSpy.mockRestore()
  })
})
