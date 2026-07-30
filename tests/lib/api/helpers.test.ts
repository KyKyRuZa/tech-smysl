/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect } from 'vitest'
import { blogPostSelect, getSearchParams } from '@/lib/api/helpers'

describe('api helpers', () => {
  it('blogPostSelect contains expected fields', () => {
    expect(blogPostSelect).toMatchObject({
      id: true,
      slug: true,
      title: true,
      excerpt: true,
      content: true,
      imageUrl: true,
      published: true,
      publishedAt: true,
      tags: true,
      createdAt: true,
    })
  })

  it('getSearchParams returns URLSearchParams', () => {
    const url = 'http://localhost:3001/api/projects?all=true'
    const req = new Request(url) as any
    const params = getSearchParams(req)
    expect(params.get('all')).toBe('true')
  })
})
