import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import Hero from '@/components/sections/Hero'

describe('Component: Hero (RU/EN)', () => {
  it('renders Russian defaults when no props are provided', () => {
    render(<Hero locale="ru" />)
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'Техсмысл: +30 IT-решений ежегодно'
    )
    expect(screen.getByText('Начнём работать вместе прямо сейчас')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Обсудить проект' })).toBeInTheDocument()
    expect(screen.getByText('Ответ в течение 15 минут · Можно в Telegram')).toBeInTheDocument()
  })

  it('renders provided English copy via props', () => {
    render(
      <Hero
        locale="en"
        eyebrow="Let's work together"
        title="Tech Smysl: +30 IT solutions yearly"
        ctaText="Discuss project"
        microNote="Reply within 15 minutes"
        slides={[{ imageUrl: '/x.svg', subtitle: 'EN subtitle' }]}
      />
    )
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'Tech Smysl: +30 IT solutions yearly'
    )
    expect(screen.getByText("Let's work together")).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Discuss project' })).toBeInTheDocument()
    expect(screen.getByText('Reply within 15 minutes')).toBeInTheDocument()
  })

  it('uses the provided slides instead of defaults', () => {
    const { container } = render(
      <Hero locale="ru" slides={[{ imageUrl: '/custom.svg', imageAlt: 'Custom alt' }]} />
    )
    const img = container.querySelector('img')
    expect(img).toHaveAttribute('src', '/custom.svg')
    expect(img).toHaveAttribute('alt', 'Custom alt')
  })

  it('renders admin controls only when editable', () => {
    const { container, rerender } = render(<Hero locale="ru" />)
    expect(container.querySelector('[class*="heroEditDots"]')).toBeNull()

    rerender(<Hero locale="ru" editable activeIndex={0} onActiveChange={() => {}} />)
    expect(container.querySelector('[class*="heroEditDots"]')).toBeInTheDocument()
  })
})
