'use client'

import { useState } from 'react'
import styles from './ContactsForm.module.css'

const SERVICES_EN = [
  { value: '', label: 'Select service' },
  { value: 'web', label: 'Web development' },
  { value: 'mobile', label: 'Mobile app' },
  { value: 'ar3d', label: 'AR / 3D visualization' },
  { value: 'other', label: 'Other' },
]

const SERVICES_RU = [
  { value: '', label: 'Выберите направление' },
  { value: 'web', label: 'Веб-разработка' },
  { value: 'mobile', label: 'Мобильное приложение' },
  { value: 'ar3d', label: 'AR / 3D-визуализация' },
  { value: 'other', label: 'Другое' },
]

type Status = 'idle' | 'loading' | 'success' | 'error'

type Props = {
  locale: 'ru' | 'en'
}

export default function ContactsForm({ locale }: Props) {
  const [status, setStatus] = useState<Status>('idle')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [serverError, setServerError] = useState('')

  const SERVICES = locale === 'en' ? SERVICES_EN : SERVICES_RU

  const labels = {
    name: locale === 'en' ? 'Name' : 'Имя',
    email: locale === 'en' ? 'Email' : 'Email',
    phone: locale === 'en' ? 'Phone' : 'Телефон',
    service: locale === 'en' ? 'Service' : 'Услуга',
    message: locale === 'en' ? 'Message' : 'Сообщение',
    send: locale === 'en' ? 'Send application' : 'Отправить заявку',
    sending: locale === 'en' ? 'Sending…' : 'Отправляем…',
    successTitle: locale === 'en' ? 'Application sent!' : 'Заявка отправлена!',
    successText: locale === 'en'
      ? 'Thank you! We will contact you within 15 minutes.'
      : 'Спасибо! Мы свяжемся с вами в течение 15 минут.',
    serverError: locale === 'en' ? 'Failed to send application' : 'Не удалось отправить заявку',
  }

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
        setServerError(data.error || labels.serverError)
        setStatus('error')
        return
      }

      setStatus('success')
      form.reset()
    } catch {
      setServerError(labels.serverError)
      setStatus('error')
    }
  }

  if (status === 'success') {
    return (
      <div className={styles.success}>
        <h3 className={styles.successTitle}>{labels.successTitle}</h3>
        <p className={styles.successText}>
          {labels.successText}
        </p>
      </div>
    )
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <div className={styles.field}>
        <label className={styles.label} htmlFor="name">
          {labels.name} <span className={styles.required}>*</span>
        </label>
        <input
          id="name"
          name="name"
          type="text"
          className={styles.input}
          placeholder={locale === 'en' ? 'How to address you' : 'Как к вам обращаться'}
          autoComplete="name"
        />
        {errors.name && <span className={styles.error}>{errors.name}</span>}
      </div>

      <div className={styles.row}>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="email">
            {labels.email} <span className={styles.required}>*</span>
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
            {labels.phone}
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
          {labels.service}
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
          {labels.message} <span className={styles.required}>*</span>
        </label>
        <textarea
          id="message"
          name="message"
          className={styles.textarea}
          rows={5}
          placeholder={locale === 'en' ? 'Briefly describe your task' : 'Кратко опишите задачу'}
        />
        {errors.message && <span className={styles.error}>{errors.message}</span>}
      </div>

      {status === 'error' && serverError && (
        <div className={styles.serverError}>{serverError}</div>
      )}

      <button type="submit" className={`btn btn-primary ${styles.submit}`} disabled={status === 'loading'}>
        {status === 'loading' ? labels.sending : labels.send}
      </button>
    </form>
  )
}
