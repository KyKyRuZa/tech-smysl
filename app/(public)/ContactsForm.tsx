'use client'

import { useState } from 'react'
import styles from './ContactsForm.module.css'

const SERVICES = [
  { value: '', label: 'Выберите направление' },
  { value: 'web', label: 'Веб-разработка' },
  { value: 'mobile', label: 'Мобильное приложение' },
  { value: 'ar3d', label: 'AR / 3D-визуализация' },
  { value: 'other', label: 'Другое' },
]

type Status = 'idle' | 'loading' | 'success' | 'error'

export default function ContactsForm() {
  const [status, setStatus] = useState<Status>('idle')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [serverError, setServerError] = useState('')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setStatus('loading')
    setErrors({})
    setServerError('')

    const form = e.currentTarget
    const payload = {
      name: (form.elements.namedItem('name') as HTMLInputElement).value,
      email: (form.elements.namedItem('email') as HTMLInputElement).value,
      phone: (form.elements.namedItem('phone') as HTMLInputElement).value || undefined,
      service: (form.elements.namedItem('service') as HTMLSelectElement).value || undefined,
      message: (form.elements.namedItem('message') as HTMLTextAreaElement).value,
    }

    try {
      const res = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await res.json().catch(() => ({}))

      if (!res.ok) {
        if (res.status === 400 && data.details) {
          const fieldErrors: Record<string, string> = {}
          for (const [key, value] of Object.entries(data.details as Record<string, string[]>)) {
            fieldErrors[key] = value[0]
          }
          setErrors(fieldErrors)
          setStatus('idle')
          return
        }
        setServerError(data.error || 'Не удалось отправить заявку')
        setStatus('error')
        return
      }

      setStatus('success')
      form.reset()
    } catch {
      setServerError('Не удалось отправить заявку')
      setStatus('error')
    }
  }

  if (status === 'success') {
    return (
      <div className={styles.success}>
        <h3 className={styles.successTitle}>Заявка отправлена!</h3>
        <p className={styles.successText}>
          Спасибо! Мы свяжемся с вами в течение 15 минут.
        </p>
      </div>
    )
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <div className={styles.field}>
        <label className={styles.label} htmlFor="name">
          Имя <span className={styles.required}>*</span>
        </label>
        <input
          id="name"
          name="name"
          type="text"
          className={styles.input}
          placeholder="Как к вам обращаться"
          autoComplete="name"
        />
        {errors.name && <span className={styles.error}>{errors.name}</span>}
      </div>

      <div className={styles.row}>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="email">
            Email <span className={styles.required}>*</span>
          </label>
          <input
            id="email"
            name="email"
            type="email"
            className={styles.input}
            placeholder="you@company.com"
            autoComplete="email"
          />
          {errors.email && <span className={styles.error}>{errors.email}</span>}
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="phone">
            Телефон
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            className={styles.input}
            placeholder="+7 (___) ___-__-__"
            autoComplete="tel"
          />
          {errors.phone && <span className={styles.error}>{errors.phone}</span>}
        </div>
      </div>

      <div className={styles.field}>
        <label className={styles.label} htmlFor="service">
          Услуга
        </label>
        <select id="service" name="service" className={styles.input}>
          {SERVICES.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
        {errors.service && <span className={styles.error}>{errors.service}</span>}
      </div>

      <div className={styles.field}>
        <label className={styles.label} htmlFor="message">
          Сообщение <span className={styles.required}>*</span>
        </label>
        <textarea
          id="message"
          name="message"
          className={styles.textarea}
          rows={5}
          placeholder="Кратко опишите задачу"
        />
        {errors.message && <span className={styles.error}>{errors.message}</span>}
      </div>

      {status === 'error' && serverError && (
        <div className={styles.serverError}>{serverError}</div>
      )}

      <button type="submit" className={`btn btn-primary ${styles.submit}`} disabled={status === 'loading'}>
        {status === 'loading' ? 'Отправляем…' : 'Отправить заявку'}
      </button>
    </form>
  )
}
