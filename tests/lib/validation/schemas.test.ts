import { describe, it, expect } from 'vitest'
import { loginSchema, projectSchema, heroSlideSchema, reviewSchema, applicationSchema } from '@/lib/validation/schemas'

describe('validation schemas', () => {
  describe('loginSchema', () => {
    it('accepts valid data', () => {
      const result = loginSchema.safeParse({ email: 'admin@example.com', password: 'secret' })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.email).toBe('admin@example.com')
        expect(result.data.password).toBe('secret')
      }
    })

    it('rejects invalid email', () => {
      const result = loginSchema.safeParse({ email: 'not-an-email', password: 'secret' })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.flatten().fieldErrors.email).toBeDefined()
      }
    })

    it('rejects missing password', () => {
      const result = loginSchema.safeParse({ email: 'admin@example.com' })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.flatten().fieldErrors.password).toBeDefined()
      }
    })
  })

  describe('projectSchema', () => {
    it('accepts valid data', () => {
      const result = projectSchema.safeParse({
        slug: 'my-project',
        title: 'My Project',
        published: true,
        order: 1,
      })
      expect(result.success).toBe(true)
    })

    it('rejects invalid slug format', () => {
      const result = projectSchema.safeParse({ slug: 'My Project!', title: 'Title' })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.flatten().fieldErrors.slug).toBeDefined()
      }
    })

    it('rejects missing title', () => {
      const result = projectSchema.safeParse({ slug: 'my-project' })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.flatten().fieldErrors.title).toBeDefined()
      }
    })

    it('accepts optional fields', () => {
      const result = projectSchema.safeParse({
        slug: 'my-project',
        title: 'Title',
        subtitle: 'Sub',
        description: 'Desc',
        content: 'Content',
        heroImage: 'img.jpg',
        bgImage: 'bg.jpg',
        imageUrl: 'img.jpg',
        benefits: ['a'],
        useCases: 'uc',
        tags: ['t'],
        published: false,
        order: 0,
      })
      expect(result.success).toBe(true)
    })
  })

  describe('heroSlideSchema', () => {
    it('accepts valid data', () => {
      const result = heroSlideSchema.safeParse({
        imageUrl: 'slide.jpg',
        title: 'Slide',
        published: true,
        order: 0,
      })
      expect(result.success).toBe(true)
    })

    it('rejects missing imageUrl', () => {
      const result = heroSlideSchema.safeParse({ title: 'Slide' })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.flatten().fieldErrors.imageUrl).toBeDefined()
      }
    })

    it('rejects invalid order type', () => {
      const result = heroSlideSchema.safeParse({ imageUrl: 'slide.jpg', order: 'not-a-number' })
      expect(result.success).toBe(false)
    })
  })

  describe('reviewSchema', () => {
    it('accepts valid data', () => {
      const result = reviewSchema.safeParse({
        headline: 'Great',
        body: 'Review text',
        rating: 5,
      })
      expect(result.success).toBe(true)
    })

    it('rejects missing headline', () => {
      const result = reviewSchema.safeParse({ body: 'Review' })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.flatten().fieldErrors.headline).toBeDefined()
      }
    })

    it('rejects rating out of range', () => {
      const result = reviewSchema.safeParse({ headline: 'Great', body: 'Text', rating: 6 })
      expect(result.success).toBe(false)
    })
  })

  describe('applicationSchema', () => {
    it('accepts valid data with all fields', () => {
      const result = applicationSchema.safeParse({
        name: 'Иван',
        email: 'ivan@example.com',
        phone: '+79990000000',
        service: 'web',
        message: 'Нужен сайт',
      })
      expect(result.success).toBe(true)
    })

    it('accepts data with only required fields', () => {
      const result = applicationSchema.safeParse({
        name: 'Иван',
        email: 'ivan@example.com',
        message: 'Нужен сайт',
      })
      expect(result.success).toBe(true)
    })

    it('rejects missing name', () => {
      const result = applicationSchema.safeParse({
        email: 'ivan@example.com',
        message: 'Нужен сайт',
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.flatten().fieldErrors.name).toBeDefined()
      }
    })

    it('rejects invalid email', () => {
      const result = applicationSchema.safeParse({
        name: 'Иван',
        email: 'not-an-email',
        message: 'Нужен сайт',
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.flatten().fieldErrors.email).toBeDefined()
      }
    })

    it('rejects missing message', () => {
      const result = applicationSchema.safeParse({
        name: 'Иван',
        email: 'ivan@example.com',
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.flatten().fieldErrors.message).toBeDefined()
      }
    })

    it('rejects too long message', () => {
      const result = applicationSchema.safeParse({
        name: 'Иван',
        email: 'ivan@example.com',
        message: 'x'.repeat(2001),
      })
      expect(result.success).toBe(false)
    })
  })
})
