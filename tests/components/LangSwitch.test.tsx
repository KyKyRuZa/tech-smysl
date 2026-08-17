import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import LangSwitch from '@/components/layout/LangSwitch'

const { push } = vi.hoisted(() => ({ push: vi.fn() }))

vi.mock('next/navigation', () => ({
  usePathname: () => '/ru',
  useRouter: () => ({ push, replace: vi.fn(), refresh: vi.fn(), back: vi.fn() }),
}))

describe('Component: LangSwitch', () => {
  beforeEach(() => {
    push.mockClear()
  })

  it('renders both locale buttons', () => {
    render(<LangSwitch />)
    expect(screen.getByText('Рус')).toBeInTheDocument()
    expect(screen.getByText('Eng')).toBeInTheDocument()
  })

  it('marks the current locale (from pathname) as active', () => {
    render(<LangSwitch />)
    expect(screen.getByText('Рус')).toHaveAttribute('aria-current', 'true')
    expect(screen.getByText('Eng')).not.toHaveAttribute('aria-current')
  })

  it('switches to English and pushes the new locale path', () => {
    render(<LangSwitch />)
    fireEvent.click(screen.getByText('Eng'))
    expect(push).toHaveBeenCalledWith('/en')
  })

  it('does nothing when clicking the already-active locale', () => {
    render(<LangSwitch />)
    fireEvent.click(screen.getByText('Рус'))
    expect(push).not.toHaveBeenCalled()
  })
})
