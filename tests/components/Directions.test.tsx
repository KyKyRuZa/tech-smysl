import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import Directions from '@/components/sections/Directions'
import type { Project } from '@/components/sections/Directions'

const PROJECTS: Project[] = [
  { id: '1', title: 'Проект RU', slug: 'project-ru', subtitle: 'Саб', published: true, order: 0 },
  { id: '2', title: 'Project EN', slug: 'project-en', subtitle: 'Sub', published: true, order: 1 },
]

describe('Component: Directions (RU/EN)', () => {
  it('renders default Russian heading and project cards', () => {
    render(<Directions projects={PROJECTS} locale="ru" />)
    expect(screen.getByRole('heading', { level: 2, name: 'Проекты' })).toBeInTheDocument()
    expect(screen.getByText('Проект RU')).toBeInTheDocument()
    expect(screen.getByText('Project EN')).toBeInTheDocument()
  })

  it('links each project card to its locale-prefixed detail page', () => {
    const { container } = render(<Directions projects={PROJECTS} locale="en" />)
    expect(container.querySelector('a[href="/en/projects/project-en"]')).toBeInTheDocument()
  })

  it('renders the provided (localized) empty-state text when there are no projects', () => {
    render(<Directions projects={[]} emptyText="Пока нет проектов" locale="ru" />)
    expect(screen.getByText('Пока нет проектов')).toBeInTheDocument()
    render(<Directions projects={[]} emptyText="No projects yet." locale="en" />)
    expect(screen.getByText('No projects yet.')).toBeInTheDocument()
  })

  it('falls back to the Russian empty-state string when no override is provided', () => {
    render(<Directions projects={[]} locale="en" />)
    expect(screen.getByText('Пока нет проектов')).toBeInTheDocument()
  })
})
