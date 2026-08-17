import { describe, it, expect } from 'vitest'
import { locales, defaultLocale, isValidLocale, getLocaleFromPath } from '@/lib/i18n/get-locale'

describe('i18n: locale helpers', () => {
  it('exposes exactly ru and en as supported locales', () => {
    expect(locales).toEqual(['ru', 'en'])
    expect(locales).toHaveLength(2)
  })

  it('uses ru as default locale', () => {
    expect(defaultLocale).toBe('ru')
  })

  describe('isValidLocale', () => {
    it('accepts known locales', () => {
      expect(isValidLocale('ru')).toBe(true)
      expect(isValidLocale('en')).toBe(true)
    })

    it('rejects unknown locales', () => {
      expect(isValidLocale('fr')).toBe(false)
      expect(isValidLocale('RU')).toBe(false)
      expect(isValidLocale('')).toBe(false)
      expect(isValidLocale('de')).toBe(false)
    })
  })

  describe('getLocaleFromPath', () => {
    it('extracts locale from the first path segment', () => {
      expect(getLocaleFromPath('/ru')).toBe('ru')
      expect(getLocaleFromPath('/en/projects')).toBe('en')
      expect(getLocaleFromPath('/ru/blog/my-post')).toBe('ru')
    })

    it('returns null when no locale is present', () => {
      expect(getLocaleFromPath('/')).toBeNull()
      expect(getLocaleFromPath('/projects')).toBeNull()
      expect(getLocaleFromPath('/about-us')).toBeNull()
    })

    it('returns null for unknown locales in the path', () => {
      expect(getLocaleFromPath('/fr/projects')).toBeNull()
    })
  })
})
