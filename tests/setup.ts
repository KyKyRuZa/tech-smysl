import '@testing-library/jest-dom'
import { afterEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'
import React from 'react'

// Auto-cleanup DOM between component tests
afterEach(() => {
  cleanup()
})

// jsdom does not implement IntersectionObserver (used by useInView hook)
class MockIntersectionObserver {
  readonly root: Element | null = null
  readonly rootMargin: string = ''
  readonly thresholds: ReadonlyArray<number> = []
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() {
    return []
  }
}
vi.stubGlobal('IntersectionObserver', MockIntersectionObserver as unknown as typeof IntersectionObserver)

// Mock next/image -> plain <img> so component tests render without the optimizer
vi.mock('next/image', () => ({
  __esModule: true,
  default: (props: Record<string, unknown>) =>
    React.createElement('img', { src: props.src as string, alt: (props.alt as string) ?? '' }),
}))

// Mock next/link -> plain <a> (avoids router context requirements in jsdom)
vi.mock('next/link', () => ({
  __esModule: true,
  default: (props: Record<string, unknown>) =>
    React.createElement('a', { href: props.href as string }, props.children as React.ReactNode),
}))

// NOTE: next/navigation is intentionally NOT mocked globally here — API route
// handlers import notFound/redirect/cookies from it. Client components that need
// usePathname/useRouter mock it locally in their own test files.
