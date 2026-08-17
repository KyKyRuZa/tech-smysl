import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import Articles from '@/components/sections/Articles'
import type { ArticleItem } from '@/components/sections/Articles'

const ITEMS: ArticleItem[] = [
  { id: 'a1', title: 'Статья 1', excerpt: 'Аннотация 1', readTime: '5 мин', link: '/ru/blog/a1', order: 0 },
  { id: 'a2', title: 'Article 2', excerpt: 'Excerpt 2', readTime: '8 min', link: '/en/blog/a2', order: 1 },
]

describe('Component: Articles (RU/EN)', () => {
  it('renders default Russian heading and items', () => {
    render(<Articles items={ITEMS} />)
    expect(screen.getByRole('heading', { level: 2, name: 'Полезное' })).toBeInTheDocument()
    expect(screen.getByText('Статья 1')).toBeInTheDocument()
    expect(screen.getByText('Article 2')).toBeInTheDocument()
  })

  it('renders a "read more" link when provided', () => {
    render(<Articles items={ITEMS} readMoreText="Все статьи" readMoreLink="/ru/blog" />)
    const link = screen.getByRole('link', { name: 'Все статьи' })
    expect(link).toHaveAttribute('href', '/ru/blog')
  })

  it('renders the provided (localized) empty-state text when there are no items', () => {
    render(<Articles items={[]} emptyText="Пока нет статей" />)
    expect(screen.getByText('Пока нет статей')).toBeInTheDocument()
    render(<Articles items={[]} emptyText="No articles yet" />)
    expect(screen.getByText('No articles yet')).toBeInTheDocument()
  })

  it('falls back to the Russian empty-state string when no override is provided', () => {
    render(<Articles items={[]} />)
    expect(screen.getByText('Пока нет статей')).toBeInTheDocument()
  })
})
