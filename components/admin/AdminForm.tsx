'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import styles from '@/app/admin/admin.module.css'

export type FieldType = 'text' | 'textarea' | 'number' | 'checkbox' | 'file' | 'tags'

export interface FieldDef {
  name: string
  label: string
  type: FieldType
  required?: boolean
  placeholder?: string
}

export interface TranslationSection {
  locale: string
  label: string
  fields: FieldDef[]
}

interface AdminFormProps {
  entity: 'projects' | 'blog-posts' | 'reviews' | 'hero-slides'
  fields: FieldDef[]
  initialData?: Record<string, unknown> | null
  redirectPath: string
  translationSections?: TranslationSection[]
  initialTranslations?: Record<string, Record<string, unknown>>
}

async function uploadFile(file: File, folder: string): Promise<string> {
  const formData = new FormData()
  formData.append('image', file)
  formData.append('folder', folder)
  const res = await fetch('/api/upload', { method: 'POST', body: formData })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || 'Не удалось загрузить изображение')
  }
  const data = await res.json()
  return data.url as string
}

export default function AdminForm({
  entity,
  fields,
  initialData,
  redirectPath,
  translationSections,
  initialTranslations,
}: AdminFormProps) {
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
          jsonData[input.name] = await uploadFile(file, entity)
        } else if (input.dataset.currentUrl) {
          jsonData[input.name] = input.dataset.currentUrl
        }
      }

      const elements = form.elements
      for (let i = 0; i < elements.length; i++) {
        const el = elements[i] as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
        if (!el.name || el.type === 'file') continue
        if (jsonData[el.name] !== undefined) continue
        if (el.name.startsWith('translations[')) continue

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

      const translations: Record<string, Record<string, unknown>> = {}
      if (translationSections) {
        for (const section of translationSections) {
          const sectionData: Record<string, unknown> = {}
          for (const field of section.fields) {
            const input = form.querySelector<HTMLInputElement | HTMLTextAreaElement>(
              `[name="translations[${section.locale}][${field.name}]"]`
            )
            if (input) {
              if (input.type === 'checkbox') {
                sectionData[field.name] = (input as HTMLInputElement).checked
              } else if (input.type === 'number') {
                sectionData[field.name] = input.value ? Number(input.value) : undefined
              } else if ((input as HTMLInputElement).dataset?.array === 'true') {
                sectionData[field.name] = input.value
                  .split(',')
                  .map((s) => s.trim())
                  .filter(Boolean)
              } else {
                sectionData[field.name] = input.value
              }
            }
          }
          translations[section.locale] = sectionData
        }
        jsonData.translations = translations
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

      await router.push(redirectPath)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Что-то пошло не так')
      setLoading(false)
    }
  }

  function renderField(field: FieldDef, value: unknown, namePrefix?: string) {
    const name = namePrefix ? `${namePrefix}[${field.name}]` : field.name
    const safeId = name.replace(/[^a-zA-Z0-9_-]/g, '_')
    const currentUrl = typeof value === 'string' ? value : ''

    if (field.type === 'file') {
      return (
        <div className={styles.adminFormGroup} key={field.name}>
          <label htmlFor={safeId}>{field.label}</label>
          {currentUrl && (
            <img
              src={currentUrl}
              alt={field.label}
              style={{ maxWidth: 200, maxHeight: 100, borderRadius: 8, marginBottom: 8 }}
            />
          )}
          <input
            id={safeId}
            name={name}
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
          <label htmlFor={safeId}>{field.label}</label>
          <textarea
            id={safeId}
            name={name}
            required={field.required}
            defaultValue={typeof value === 'string' ? value : ''}
            placeholder={field.placeholder}
          />
        </div>
      )
    }

    if (field.type === 'checkbox') {
      return (
        <div className={`${styles.adminFormGroup} ${styles.adminFormGroupCheckbox}`} key={field.name}>
          <label htmlFor={safeId}>{field.label}</label>
          <input
            id={safeId}
            name={name}
            type="checkbox"
            defaultChecked={Boolean(value)}
          />
        </div>
      )
    }

    if (field.type === 'number') {
      return (
        <div className={styles.adminFormGroup} key={field.name}>
          <label htmlFor={safeId}>{field.label}</label>
          <input
            id={safeId}
            name={name}
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
          <label htmlFor={safeId}>{field.label}</label>
          <input
            id={safeId}
            name={name}
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
        <label htmlFor={safeId}>{field.label}</label>
        <input
          id={safeId}
          name={name}
          type="text"
          required={field.required}
          defaultValue={typeof value === 'string' ? value : ''}
          placeholder={field.placeholder}
        />
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className={styles.adminForm}>
      {fields.map((field) => renderField(field, initialData?.[field.name]))}

      {translationSections?.map((section) => {
        const sectionInitial = initialTranslations?.[section.locale]
        return (
          <div key={section.locale} className={styles.adminTranslationSection}>
            <h3 className={styles.adminSectionTitle}>{section.label}</h3>
            {section.fields.map((field) =>
              renderField(field, sectionInitial?.[field.name], `translations[${section.locale}]`)
            )}
          </div>
        )
      })}

      {error && <div className={styles.adminError}>{error}</div>}

      <div className={styles.adminFormActions}>
        <Link href={redirectPath} className={`${styles.adminBtn} ${styles.adminBtnSecondary}`}>
          Отмена
        </Link>
        <button
          type="submit"
          className={`${styles.adminBtn} ${styles.adminBtnPrimary}`}
          disabled={loading}
        >
          {loading ? 'Сохранение...' : isEdit ? 'Сохранить' : 'Создать'}
        </button>
      </div>
    </form>
  )
}
