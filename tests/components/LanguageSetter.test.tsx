import { describe, it, expect, afterEach } from 'vitest'
import { render } from '@testing-library/react'
import LanguageSetter from '@/components/layout/LanguageSetter'

describe('Component: LanguageSetter', () => {
  afterEach(() => {
    document.documentElement.removeAttribute('lang')
  })

  it('sets the <html lang> attribute for a valid locale', () => {
    render(<LanguageSetter locale="en" />)
    expect(document.documentElement.lang).toBe('en')
  })

  it('sets ru lang attribute', () => {
    render(<LanguageSetter locale="ru" />)
    expect(document.documentElement.lang).toBe('ru')
  })

  it('does not set lang for an invalid locale', () => {
    render(<LanguageSetter locale="fr" />)
    expect(document.documentElement.lang).toBe('')
  })

  it('renders nothing', () => {
    const { container } = render(<LanguageSetter locale="ru" />)
    expect(container).toBeEmptyDOMElement()
  })
})
