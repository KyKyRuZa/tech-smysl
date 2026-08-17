import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import ContactsForm from '@/app/[locale]/(public)/ContactsForm'

const fetchMock = vi.fn()

function mockJsonResponse(status: number, body: unknown) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  }
}

describe('Component: ContactsForm (RU/EN + validation)', () => {
  beforeEach(() => {
    fetchMock.mockReset()
    vi.stubGlobal('fetch', fetchMock)
  })

  describe('localized labels', () => {
    it('renders Russian labels and submit text', () => {
      render(<ContactsForm locale="ru" />)
      expect(screen.getByLabelText('Имя *')).toBeInTheDocument()
      expect(screen.getByLabelText('Email *')).toBeInTheDocument()
      expect(screen.getByLabelText('Телефон')).toBeInTheDocument()
      expect(screen.getByLabelText('Услуга')).toBeInTheDocument()
      expect(screen.getByLabelText('Сообщение *')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Отправить заявку' })).toBeInTheDocument()
    })

    it('renders English labels and submit text', () => {
      render(<ContactsForm locale="en" />)
      expect(screen.getByLabelText('Name *')).toBeInTheDocument()
      expect(screen.getByLabelText('Email *')).toBeInTheDocument()
      expect(screen.getByLabelText('Phone')).toBeInTheDocument()
      expect(screen.getByLabelText('Service')).toBeInTheDocument()
      expect(screen.getByLabelText('Message *')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Send application' })).toBeInTheDocument()
    })

    it('uses locale-specific placeholders', () => {
      const { rerender } = render(<ContactsForm locale="ru" />)
      expect(screen.getByPlaceholderText('Как к вам обращаться')).toBeInTheDocument()

      rerender(<ContactsForm locale="en" />)
      expect(screen.getByPlaceholderText('How to address you')).toBeInTheDocument()
    })
  })

  describe('server-side validation errors', () => {
    it('shows field errors returned by the API (RU)', async () => {
      fetchMock.mockResolvedValue(
        mockJsonResponse(400, {
          error: 'Validation failed',
          details: { name: ['Имя обязательно'], email: ['Некорректный email'], message: ['Опишите задачу'] },
        })
      )

      render(<ContactsForm locale="ru" />)
      fireEvent.submit(screen.getByRole('button', { name: 'Отправить заявку' }).closest('form')!)

      expect(await screen.findByText('Имя обязательно')).toBeInTheDocument()
      expect(screen.getByText('Некорректный email')).toBeInTheDocument()
      expect(screen.getByText('Опишите задачу')).toBeInTheDocument()
      expect(fetchMock).toHaveBeenCalledTimes(1)
    })

    it('shows English field errors returned by the API (EN)', async () => {
      fetchMock.mockResolvedValue(
        mockJsonResponse(400, {
          error: 'Validation failed',
          details: { name: ['Name is required'], email: ['Invalid email'], message: ['Describe the task'] },
        })
      )

      render(<ContactsForm locale="en" />)
      fireEvent.submit(screen.getByRole('button', { name: 'Send application' }).closest('form')!)

      expect(await screen.findByText('Name is required')).toBeInTheDocument()
      expect(screen.getByText('Invalid email')).toBeInTheDocument()
      expect(screen.getByText('Describe the task')).toBeInTheDocument()
    })
  })

  describe('successful submission', () => {
    it('posts the payload and shows the RU success message', async () => {
      fetchMock.mockResolvedValue(mockJsonResponse(201, { data: { id: '1', status: 'ok' } }))

      render(<ContactsForm locale="ru" />)
      fireEvent.change(screen.getByLabelText('Имя *'), { target: { value: 'Иван Петров' } })
      fireEvent.change(screen.getByLabelText('Email *'), { target: { value: 'ivan@example.com' } })
      fireEvent.change(screen.getByLabelText('Телефон'), { target: { value: '+79990000000' } })
      fireEvent.change(screen.getByLabelText('Услуга'), { target: { value: 'web' } })
      fireEvent.change(screen.getByLabelText('Сообщение *'), { target: { value: 'Нужен сайт' } })

      fireEvent.submit(screen.getByRole('button', { name: 'Отправить заявку' }).closest('form')!)

      await waitFor(() => {
        expect(fetchMock).toHaveBeenCalledWith(
          '/api/applications',
          expect.objectContaining({
            method: 'POST',
            body: JSON.stringify({
              name: 'Иван Петров',
              email: 'ivan@example.com',
              phone: '+79990000000',
              service: 'web',
              message: 'Нужен сайт',
            }),
          })
        )
      })

      expect(await screen.findByText('Заявка отправлена!')).toBeInTheDocument()
    })

    it('shows the EN success message', async () => {
      fetchMock.mockResolvedValue(mockJsonResponse(201, { data: { id: '1', status: 'ok' } }))

      render(<ContactsForm locale="en" />)
      fireEvent.change(screen.getByLabelText('Name *'), { target: { value: 'John' } })
      fireEvent.change(screen.getByLabelText('Email *'), { target: { value: 'john@example.com' } })
      fireEvent.change(screen.getByLabelText('Message *'), { target: { value: 'Need a site' } })

      fireEvent.submit(screen.getByRole('button', { name: 'Send application' }).closest('form')!)
      expect(await screen.findByText('Application sent!')).toBeInTheDocument()
    })
  })

  describe('failure handling', () => {
    it('shows a server error message for non-validation failures (RU)', async () => {
      fetchMock.mockResolvedValue(mockJsonResponse(500, { error: 'База недоступна' }))

      render(<ContactsForm locale="ru" />)
      fireEvent.submit(screen.getByRole('button', { name: 'Отправить заявку' }).closest('form')!)

      expect(await screen.findByText('База недоступна')).toBeInTheDocument()
    })

    it('shows the fallback error when the request throws', async () => {
      fetchMock.mockRejectedValue(new Error('network down'))

      render(<ContactsForm locale="en" />)
      fireEvent.submit(screen.getByRole('button', { name: 'Send application' }).closest('form')!)

      expect(await screen.findByText('Failed to send application')).toBeInTheDocument()
    })
  })
})
