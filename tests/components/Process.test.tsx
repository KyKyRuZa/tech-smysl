import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import Process from '@/components/sections/Process'

const EN_STEPS = [
  { title: 'Discovery', desc: 'We study the business.' },
  { title: 'Design', desc: 'We build a prototype.' },
  { title: 'Development', desc: 'We write code.' },
  { title: 'Launch', desc: 'We deploy.' },
]

describe('Component: Process (RU/EN)', () => {
  it('renders the 4 default Russian steps', () => {
    render(<Process />)
    expect(screen.getByRole('heading', { level: 2, name: 'Как мы работаем' })).toBeInTheDocument()
    expect(screen.getByText('Анализ и аудит')).toBeInTheDocument()
    expect(screen.getByText('Дизайн и прототипирование')).toBeInTheDocument()
    expect(screen.getByText('Разработка')).toBeInTheDocument()
    expect(screen.getByText('Запуск и поддержка')).toBeInTheDocument()
  })

  it('renders provided English steps', () => {
    render(<Process steps={EN_STEPS} title="How we work" subtitle="Our process" />)
    expect(screen.getByRole('heading', { level: 2, name: 'How we work' })).toBeInTheDocument()
    expect(screen.getByText('Discovery')).toBeInTheDocument()
    expect(screen.getByText('Launch')).toBeInTheDocument()
  })

  it('numbers the steps sequentially', () => {
    render(<Process steps={EN_STEPS} />)
    expect(screen.getByText('01')).toBeInTheDocument()
    expect(screen.getByText('04')).toBeInTheDocument()
  })
})
