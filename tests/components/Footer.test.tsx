import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import Footer from '@/components/layout/Footer'

describe('Component: Footer (RU/EN)', () => {
  it('renders Russian copy for ru', () => {
    render(<Footer locale="ru" />)
    expect(screen.getByText('Tech Smysl')).toBeInTheDocument()
    expect(screen.getByText('Навигация')).toBeInTheDocument()
    expect(screen.getByText('Об агентстве')).toBeInTheDocument()
    expect(screen.getByText('Портфолио')).toBeInTheDocument()
    expect(screen.getByText('Обсудить проект')).toBeInTheDocument()
    expect(screen.getByText('Контакты')).toBeInTheDocument()
  })

  it('renders English copy for en', () => {
    render(<Footer locale="en" />)
    expect(screen.getByText('Navigation')).toBeInTheDocument()
    expect(screen.getByText('About')).toBeInTheDocument()
    expect(screen.getByText('Portfolio')).toBeInTheDocument()
    expect(screen.getByText('Discuss project')).toBeInTheDocument()
    expect(screen.getByText('Contacts')).toBeInTheDocument()
  })

  it('links to the locale-prefixed routes', () => {
    const { container } = render(<Footer locale="en" />)
    const about = container.querySelector(`a[href="/en/about"]`)
    const projects = container.querySelector(`a[href="/en/projects"]`)
    expect(about).toBeInTheDocument()
    expect(projects).toBeInTheDocument()
  })
})
