import { describe, it, expect } from 'vitest'
import { toSlug } from '@/lib/slug'

describe('toSlug', () => {
  it('converts Cyrillic to Latin', () => {
    expect(toSlug('Привет мир')).toBe('privet-mir')
  })

  it('lowercases and replaces spaces', () => {
    expect(toSlug('My Project')).toBe('my-project')
  })

  it('removes special characters', () => {
    expect(toSlug('Project #1!')).toBe('project-1')
  })

  it('handles empty string', () => {
    expect(toSlug('')).toBe('')
  })

  it('handles mixed Cyrillic and Latin', () => {
    expect(toSlug('Мой Project 2025')).toBe('moy-project-2025')
  })
})
