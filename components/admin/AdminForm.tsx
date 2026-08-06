'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import styles from '@/app/admin/admin.module.css'

export type FieldType = 'text' | 'textarea' | 'number' | 'checkbox' | 'file' | 'tags'

export interface FieldDef {
  name: string
  label: string
  type: FieldType
  required?: boolean
  placeholder?: string
}

interface AdminFormProps {
  entity: 'projects' | 'blog-posts' | 'reviews' | 'hero-slides'
  fields: FieldDef[]
  initialData?: Record<string, unknown> | null
  redirectPath: string
}

async function uploadFile(file: File): Promise<string> {
  const formData = new FormData()
  formData.append('image', file)
  const res = await fetch('/api/upload', { method: 'POST', body: formData })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || 'Не удалось загрузить изображение')
  }
  const data = await res.json()
  return data.url as string
}

export default function AdminForm({ entity, fields, initialData, redirectPath }: AdminFormProps) {
  const router = useRouter()
  const isEdit = Boolean(initialData?.id)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const form = e.currentTarget
      const jsonData: Record<string, unknown> = {}
      const fileInputs = form.querySelectorAll<HTMLInputElement>('input[type="file"]')

      for (const input of Array.from(fileInputs)) {
        const file = input.files?.[0]
        if (file) {
          jsonData[input.name] = await uploadFile(file)
        } else if (input.dataset.currentUrl) {
          jsonData[input.name] = input.dataset.currentUrl
        }
      }

      const elements = form.elements
      for (let i = 0; i < elements.length; i++) {
        const el = elements[i] as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
        if (!el.name || el.type === 'file') continue
        if (jsonData[el.name] !== undefined) continue

        if (el.type === 'checkbox') {
          jsonData[el.name] = (el as HTMLInputElement).checked
        } else if (el.type === 'number') {
          jsonData[el.name] = el.value ? Number(el.value) : undefined
        } else if ((el as HTMLInputElement).dataset?.array === 'true') {
          jsonData[el.name] = el.value
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean)
        } else {
          jsonData[el.name] = el.value
        }
      }

      const url = isEdit ? `/api/${entity}/${initialData!.id}` : `/api/${entity}`
      const method = isEdit ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(jsonData),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setError(data.error || data.details || 'Не удалось сохранить')
        setLoading(false)
        return
      }

      router.push(redirectPath)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Что-то пошло не так')
      setLoading(false)
    }
  }

  async function handleDelete() {
    if (!initialData?.id) return
    if (!confirm('Вы уверены, что хотите удалить?')) return
    setLoading(true)
    try {
      const res = await fetch(`/api/${entity}/${initialData.id}`, { method: 'DELETE' })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setError(data.error || 'Не удалось удалить')
        setLoading(false)
        return
      }
      router.push(redirectPath)
      router.refresh()
    } catch {
      setError('Не удалось удалить')
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className={styles.adminForm}>
      {fields.map((field) => {
        const value = initialData?.[field.name]
        const currentUrl = typeof value === 'string' ? value : ''

        if (field.type === 'file') {
          return (
            <div className={styles.adminFormGroup} key={field.name}>
              <label htmlFor={field.name}>{field.label}</label>
              {currentUrl && (
                <img
                  src={currentUrl}
                  alt={field.label}
                  style={{ maxWidth: 200, maxHeight: 100, borderRadius: 8, marginBottom: 8 }}
                />
              )}
              <input
                id={field.name}
                name={field.name}
                type="file"
                accept="image/*"
                data-current-url={currentUrl}
              />
            </div>
          )
        }

        if (field.type === 'textarea') {
          return (
            <div className={styles.adminFormGroup} key={field.name}>
              <label htmlFor={field.name}>{field.label}</label>
              <textarea
                id={field.name}
                name={field.name}
                required={field.required}
                defaultValue={typeof value === 'string' ? value : ''}
                placeholder={field.placeholder}
              />
            </div>
          )
        }

        if (field.type === 'checkbox') {
          return (
            <div className={styles.adminFormGroup} key={field.name}>
              <label htmlFor={field.name}>{field.label}</label>
              <input
                id={field.name}
                name={field.name}
                type="checkbox"
                defaultChecked={Boolean(value)}
              />
            </div>
          )
        }

        if (field.type === 'number') {
          return (
            <div className={styles.adminFormGroup} key={field.name}>
              <label htmlFor={field.name}>{field.label}</label>
              <input
                id={field.name}
                name={field.name}
                type="number"
                required={field.required}
                defaultValue={typeof value === 'number' ? value : 0}
              />
            </div>
          )
        }

        if (field.type === 'tags') {
          const arr = Array.isArray(value) ? (value as string[]).join(', ') : ''
          return (
            <div className={styles.adminFormGroup} key={field.name}>
              <label htmlFor={field.name}>{field.label}</label>
              <input
                id={field.name}
                name={field.name}
                type="text"
                data-array="true"
                defaultValue={arr}
                placeholder={field.placeholder}
              />
            </div>
          )
        }

        return (
          <div className={styles.adminFormGroup} key={field.name}>
            <label htmlFor={field.name}>{field.label}</label>
            <input
              id={field.name}
              name={field.name}
              type="text"
              required={field.required}
              defaultValue={typeof value === 'string' ? value : ''}
              placeholder={field.placeholder}
            />
          </div>
        )
      })}

      {error && <div className={styles.adminError}>{error}</div>}

      <div className={styles.adminFormActions}>
        <a href={redirectPath} className={`${styles.adminBtn} ${styles.adminBtnSecondary}`}>
          Отмена
        </a>
        <button
          type="submit"
          className={`${styles.adminBtn} ${styles.adminBtnPrimary}`}
          disabled={loading}
        >
          {loading ? 'Сохранение...' : isEdit ? 'Сохранить' : 'Создать'}
        </button>
        {isEdit && (
          <button
            type="button"
            onClick={handleDelete}
            className={`${styles.adminBtn} ${styles.adminBtnDanger}`}
            disabled={loading}
          >
            Удалить
          </button>
        )}
      </div>
    </form>
  )
}
