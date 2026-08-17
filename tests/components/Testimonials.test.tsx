import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import Testimonials from '@/components/sections/Testimonials'

const RU_ITEMS = [
  { headline: 'Заголовок 1', body: 'Тело 1', author: 'Автор 1', role: 'Роль 1' },
  { headline: 'Заголовок 2', body: 'Тело 2', author: 'Автор 2', role: 'Роль 2' },
]

describe('Component: Testimonials (RU/EN)', () => {
  it('renders default Russian heading and items', () => {
    render(<Testimonials items={RU_ITEMS} />)
    expect(screen.getByRole('heading', { level: 2, name: /Истории успеха/ })).toBeInTheDocument()
    expect(screen.getByText('Заголовок 1')).toBeInTheDocument()
    expect(screen.getByText('Автор 1')).toBeInTheDocument()
  })

  it('renders the provided (localized) empty-state text when there are no items', () => {
    render(<Testimonials items={[]} emptyText="Пока нет отзывов" />)
    expect(screen.getByText('Пока нет отзывов')).toBeInTheDocument()
    render(<Testimonials items={[]} emptyText="No reviews yet" />)
    expect(screen.getByText('No reviews yet')).toBeInTheDocument()
  })

  it('falls back to the Russian empty-state string when no override is provided', () => {
    render(<Testimonials items={[]} />)
    expect(screen.getByText('Пока нет отзывов')).toBeInTheDocument()
  })

  it('renders all provided items', () => {
    render(<Testimonials items={RU_ITEMS} />)
    expect(screen.getByText('Заголовок 2')).toBeInTheDocument()
    expect(screen.getByText('Автор 2')).toBeInTheDocument()
  })
})
