import { describe, it, expect, vi } from 'vitest'
import { logger } from '@/lib/logger'

describe('logger', () => {
  it('logs info messages', () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
    logger.info('test message', { key: 'value' })
    expect(consoleSpy).toHaveBeenCalledTimes(1)
    const logArg = consoleSpy.mock.calls[0][0]
    expect(typeof logArg).toBe('string')
    const parsed = JSON.parse(logArg)
    expect(parsed.level).toBe('info')
    expect(parsed.message).toBe('test message')
    expect(parsed.key).toBe('value')
    expect(parsed.timestamp).toBeDefined()
    consoleSpy.mockRestore()
  })

  it('logs error messages', () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
    logger.error('something failed', { code: 500 })
    expect(consoleSpy).toHaveBeenCalledTimes(1)
    const parsed = JSON.parse(consoleSpy.mock.calls[0][0])
    expect(parsed.level).toBe('error')
    expect(parsed.message).toBe('something failed')
    consoleSpy.mockRestore()
  })
})
