/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest'

type Where = any
type OrderBy = any

function passWhere(item: any, where: Where): boolean {
  if (!where) return true
  if (where.published !== undefined && item.published !== where.published) return false
  const some = where.translations?.some
  if (some) {
    const matches = (item.translations ?? []).some((t: any) => {
      if (some.locale && t.locale !== some.locale) return false
      if (some.slug && t.slug !== some.slug) return false
      return true
    })
    if (!matches) return false
  }
  return true
}

function applyOrderBy(arr: any[], orderBy: OrderBy): any[] {
  if (!orderBy) return arr
  const [key, dir] = Object.entries(orderBy)[0] as [string, 'asc' | 'desc']
  return [...arr].sort((a, b) => {
    const av = a[key]
    const bv = b[key]
    const cmp = av > bv ? 1 : av < bv ? -1 : 0
    return dir === 'desc' ? -cmp : cmp
  })
}

const { mockPrisma } = vi.hoisted(() => {
  const makeModel = () => {
    const store: Record<string, any[]> = { data: [] }
    return {
      _store: store,
      findMany: vi.fn((args: { where?: Where; orderBy?: OrderBy; take?: number } = {}) => {
        let rows = store.data.filter((item) => passWhere(item, args.where))
        rows = applyOrderBy(rows, args.orderBy)
        if (args.take) rows = rows.slice(0, args.take)
        return Promise.resolve(rows)
      }),
      findFirst: vi.fn((args: { where?: Where } = {}) => {
        const row = store.data.find((item) => passWhere(item, args.where))
        return Promise.resolve(row ?? null)
      }),
      seed: (rows: any[]) => {
        store.data = rows
      },
    }
  }
  return {
    mockPrisma: {
      heroSlide: makeModel(),
      project: makeModel(),
      review: makeModel(),
      blogPost: makeModel(),
    },
  }
})

vi.mock('@/lib/prisma', () => ({ prisma: mockPrisma }))
// Bypass in-memory cache so each call hits the factory
vi.mock('@/lib/cache', () => ({ cached: (_key: string, factory: () => any) => factory() }))

import {
  getLocalizedHeroSlides,
  getLocalizedProjects,
  getLocalizedReviews,
  getLocalizedBlogPosts,
  getLocalizedProjectBySlug,
} from '@/lib/i18n/queries'

describe('i18n: localized queries', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockPrisma.heroSlide._store.data = []
    mockPrisma.project._store.data = []
    mockPrisma.review._store.data = []
    mockPrisma.blogPost._store.data = []
  })

  describe('getLocalizedProjects', () => {
    it('merges the matching locale translation and only returns published', async () => {
      mockPrisma.project.seed([
        {
          id: 'p1',
          published: true,
          imageUrl: '/x.png',
          bgImage: null,
          heroImage: null,
          translations: [{ locale: 'ru', slug: 'proekt', title: 'Проект', subtitle: 'Саб', description: 'Опис', content: 'Контент', useCases: 'Кейсы', benefits: ['b1'], tags: ['t1'] }],
        },
        { id: 'p2', published: false, translations: [] },
      ])

      const result = await getLocalizedProjects('ru')
      expect(result).toHaveLength(1)
      expect(result[0]).toMatchObject({
        id: 'p1',
        slug: 'proekt',
        title: 'Проект',
        subtitle: 'Саб',
        benefits: ['b1'],
        tags: ['t1'],
        published: true,
      })
    })

    it('falls back to empty arrays for benefits/tags when translation is missing', async () => {
      mockPrisma.project.seed([
        { id: 'p1', published: true, translations: [], imageUrl: null, bgImage: null, heroImage: null },
      ])

      const result = await getLocalizedProjects('en')
      expect(result[0].title).toBeUndefined()
      expect(result[0].benefits).toEqual([])
      expect(result[0].tags).toEqual([])
    })
  })

  describe('getLocalizedHeroSlides', () => {
    it('returns only published slides with translated copy', async () => {
      mockPrisma.heroSlide.seed([
        {
          id: 's1',
          published: true,
          order: 0,
          imageUrl: '/s.png',
          ctaLink: '/x',
          translations: [{ locale: 'en', title: 'Hero EN', subtitle: 'Sub EN', ctaText: 'Go', imageAlt: 'alt' }],
        },
        { id: 's2', published: false, translations: [] },
      ])

      const result = await getLocalizedHeroSlides('en')
      expect(result).toHaveLength(1)
      expect(result[0]).toMatchObject({ title: 'Hero EN', subtitle: 'Sub EN', ctaText: 'Go', imageAlt: 'alt' })
    })
  })

  describe('getLocalizedReviews', () => {
    it('uses locale-specific author/role and defaults to empty strings when missing', async () => {
      mockPrisma.review.seed([
        {
          id: 'r1',
          published: true,
          order: 0,
          avatarUrl: null,
          rating: 5,
          translations: [{ locale: 'ru', headline: 'Заг', body: 'Тело', author: 'Автор', role: 'Роль' }],
        },
        { id: 'r2', published: true, avatarUrl: null, rating: 4, translations: [] },
      ])

      const result = await getLocalizedReviews('ru')
      expect(result[0]).toMatchObject({ headline: 'Заг', body: 'Тело', author: 'Автор', role: 'Роль' })
      expect(result[1]).toMatchObject({ headline: '', body: '', author: '', role: '' })
    })
  })

  describe('getLocalizedBlogPosts', () => {
    it('only returns posts that have a translation for the requested locale', async () => {
      mockPrisma.blogPost.seed([
        {
          id: 'b1',
          published: true,
          publishedAt: new Date('2025-01-02'),
          imageUrl: null,
          translations: [{ locale: 'ru', slug: 'post-ru', title: 'Пост', excerpt: 'Экс', content: 'Конт', tags: ['t'] }],
        },
        { id: 'b2', published: true, publishedAt: new Date('2025-01-01'), imageUrl: null, translations: [{ locale: 'en', slug: 'post-en', title: 'Post', excerpt: 'Ex', content: 'Body', tags: ['t'] }] },
      ])

      const ru = await getLocalizedBlogPosts('ru')
      expect(ru).toHaveLength(1)
      expect(ru[0].slug).toBe('post-ru')

      const en = await getLocalizedBlogPosts('en')
      expect(en).toHaveLength(1)
      expect(en[0].slug).toBe('post-en')
    })

    it('takes only 3 latest posts', async () => {
      mockPrisma.blogPost.seed(
        Array.from({ length: 5 }, (_, i) => ({
          id: `b${i}`,
          published: true,
          publishedAt: new Date(2025, 0, i + 1),
          imageUrl: null,
          translations: [{ locale: 'ru', slug: `s${i}`, title: `T${i}`, excerpt: '', content: '', tags: [] }],
        }))
      )
      const result = await getLocalizedBlogPosts('ru')
      expect(result).toHaveLength(3)
    })
  })

  describe('getLocalizedProjectBySlug', () => {
    it('returns null when the project is not found', async () => {
      mockPrisma.project.seed([])
      const result = await getLocalizedProjectBySlug('ru', 'missing')
      expect(result).toBeNull()
    })

    it('merges translation for the requested locale + slug', async () => {
      mockPrisma.project.seed([
        {
          id: 'p1',
          published: true,
          imageUrl: '/x.png',
          bgImage: null,
          heroImage: null,
          translations: [{ locale: 'en', slug: 'en-slug', title: 'EN Title', subtitle: 'EN Sub', description: 'd', content: 'c', useCases: 'u', benefits: ['b'], tags: ['t'] }],
        },
      ])
      const result = await getLocalizedProjectBySlug('en', 'en-slug')
      expect(result).toMatchObject({ slug: 'en-slug', title: 'EN Title', subtitle: 'EN Sub' })
    })
  })
})
