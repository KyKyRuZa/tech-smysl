import { describe, it, expect } from 'vitest'
import { heroSlideSchema, projectSchema } from '@/lib/validation/schemas'

describe('Security: URL field validation', () => {
  describe('heroSlideSchema.ctaLink', () => {
    const base = { imageUrl: 'slide.jpg' }

    it('rejects javascript: URLs (stored XSS vector)', () => {
      const result = heroSlideSchema.safeParse({ ...base, ctaLink: 'javascript:alert(1)' })
      expect(result.success).toBe(false)
    })

    it('rejects data: script URLs', () => {
      const result = heroSlideSchema.safeParse({
        ...base,
        ctaLink: 'data:text/html,<script>alert(1)</script>',
      })
      expect(result.success).toBe(false)
    })

    it('accepts http(s) URLs', () => {
      expect(heroSlideSchema.safeParse({ ...base, ctaLink: 'https://example.com/x' }).success).toBe(true)
      expect(heroSlideSchema.safeParse({ ...base, ctaLink: 'http://example.com' }).success).toBe(true)
    })

    it('accepts in-page anchors and absolute paths', () => {
      expect(heroSlideSchema.safeParse({ ...base, ctaLink: '#projects' }).success).toBe(true)
      expect(heroSlideSchema.safeParse({ ...base, ctaLink: '/internal/page' }).success).toBe(true)
    })

    it('accepts mailto/tel', () => {
      expect(heroSlideSchema.safeParse({ ...base, ctaLink: 'mailto:a@b.c' }).success).toBe(true)
      expect(heroSlideSchema.safeParse({ ...base, ctaLink: 'tel:+79990000000' }).success).toBe(true)
    })

    it('allows omission (optional)', () => {
      expect(heroSlideSchema.safeParse(base).success).toBe(true)
    })
  })

  describe('projectSchema', () => {
    it('keeps the strict slug format (no injection)', () => {
      expect(projectSchema.safeParse({ slug: 'valid-slug-1', title: 'T' }).success).toBe(true)
      expect(projectSchema.safeParse({ slug: '../evil', title: 'T' }).success).toBe(false)
      expect(projectSchema.safeParse({ slug: 'javascript:x', title: 'T' }).success).toBe(false)
    })
  })
})
