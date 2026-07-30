import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(1, 'Password is required'),
})

export const projectSchema = z.object({
  slug: z.string().min(1, 'Slug is required').regex(/^[a-z0-9-]+$/, 'Invalid slug format'),
  title: z.string().min(1, 'Title is required'),
  subtitle: z.string().optional(),
  description: z.string().optional(),
  content: z.string().optional(),
  heroImage: z.string().optional(),
  bgImage: z.string().optional(),
  imageUrl: z.string().optional(),
  benefits: z.array(z.string()).optional(),
  useCases: z.string().optional(),
  tags: z.array(z.string()).optional(),
  published: z.boolean().optional(),
  order: z.number().int().optional(),
})

export const heroSlideSchema = z.object({
  imageUrl: z.string().min(1, 'Image URL is required'),
  imageAlt: z.string().optional(),
  title: z.string().optional(),
  subtitle: z.string().optional(),
  ctaText: z.string().optional(),
  ctaLink: z.string().optional(),
  order: z.number().int().optional(),
  published: z.boolean().optional(),
})

export const reviewSchema = z.object({
  headline: z.string().min(1, 'Headline is required'),
  body: z.string().min(1, 'Body is required'),
  author: z.string().optional(),
  role: z.string().optional(),
  avatarUrl: z.string().optional(),
  rating: z.number().int().min(1).max(5).optional(),
  order: z.number().int().optional(),
  published: z.boolean().optional(),
})

export const blogPostSchema = z.object({
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/, 'Invalid slug format'),
  title: z.string().min(1, 'Title is required'),
  excerpt: z.string().optional(),
  content: z.string().min(1, 'Content is required'),
  imageUrl: z.string().optional(),
  authorId: z.string().optional(),
  published: z.boolean().optional(),
  tags: z.array(z.string()).optional(),
})
