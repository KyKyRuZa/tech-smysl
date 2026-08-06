'use client'

import { useMemo, useState } from 'react'
import type {
  HeroSlide,
  Project as DbProject,
  Review,
  BlogPost,
} from '@prisma/client'
import Hero, { type HeroSlideData } from '@/components/sections/Hero'
import Directions from '@/components/sections/Directions'
import Process from '@/components/sections/Process'
import Testimonials from '@/components/sections/Testimonials'
import Articles, { type ArticleItem } from '@/components/sections/Articles'
import CTA from '@/components/sections/CTA'
import type { FieldDef } from '@/components/admin/AdminForm'
import styles from './VisualEditor.module.css'

type Entity = 'hero-slides' | 'projects' | 'reviews' | 'blog-posts'

interface PanelState {
  entity: Entity
  mode: 'edit' | 'new'
  data: Record<string, unknown>
}

const FIELDS: Record<Entity, FieldDef[]> = {
  'hero-slides': [
    { name: 'imageUrl', label: 'Изображение', type: 'file', required: true },
    { name: 'imageAlt', label: 'Alt изображения', type: 'text' },
    { name: 'title', label: 'Заголовок', type: 'text' },
    { name: 'subtitle', label: 'Подзаголовок', type: 'textarea' },
    { name: 'ctaText', label: 'Текст кнопки', type: 'text' },
    { name: 'ctaLink', label: 'Ссылка кнопки', type: 'text' },
    { name: 'order', label: 'Порядок', type: 'number' },
    { name: 'published', label: 'Опубликовано', type: 'checkbox' },
  ],
  projects: [
    { name: 'title', label: 'Название', type: 'text', required: true },
    { name: 'slug', label: 'Slug', type: 'text', required: true },
    { name: 'subtitle', label: 'Подзаголовок', type: 'text' },
    { name: 'description', label: 'Описание', type: 'textarea' },
    { name: 'content', label: 'Содержание', type: 'textarea' },
    { name: 'heroImage', label: 'Главное изображение', type: 'file' },
    { name: 'bgImage', label: 'Фоновое изображение', type: 'file' },
    { name: 'imageUrl', label: 'Изображение', type: 'file' },
    { name: 'benefits', label: 'Преимущества (через запятую)', type: 'tags' },
    { name: 'useCases', label: 'Варианты использования', type: 'textarea' },
    { name: 'tags', label: 'Теги (через запятую)', type: 'tags' },
    { name: 'published', label: 'Опубликовано', type: 'checkbox' },
    { name: 'order', label: 'Порядок', type: 'number' },
  ],
  reviews: [
    { name: 'headline', label: 'Заголовок', type: 'text', required: true },
    { name: 'body', label: 'Текст отзыва', type: 'textarea', required: true },
    { name: 'author', label: 'Автор', type: 'text' },
    { name: 'role', label: 'Должность', type: 'text' },
    { name: 'avatarUrl', label: 'Аватар', type: 'file' },
    { name: 'rating', label: 'Оценка (1-5)', type: 'number' },
    { name: 'order', label: 'Порядок', type: 'number' },
    { name: 'published', label: 'Опубликовано', type: 'checkbox' },
  ],
  'blog-posts': [
    { name: 'title', label: 'Заголовок', type: 'text', required: true },
    { name: 'slug', label: 'Slug', type: 'text', required: true },
    { name: 'excerpt', label: 'Анонс', type: 'textarea' },
    { name: 'content', label: 'Содержание', type: 'textarea', required: true },
    { name: 'imageUrl', label: 'Изображение', type: 'file' },
    { name: 'tags', label: 'Теги (через запятую)', type: 'tags' },
    { name: 'published', label: 'Опубликовано', type: 'checkbox' },
  ],
}

function blankFor(entity: Entity): Record<string, unknown> {
  switch (entity) {
    case 'hero-slides':
      return {
        id: '',
        imageUrl: '',
        imageAlt: '',
        title: '',
        subtitle: '',
        ctaText: '',
        ctaLink: '',
        order: 0,
        published: true,
      }
    case 'projects':
      return {
        id: '',
        slug: '',
        title: '',
        subtitle: '',
        description: '',
        content: '',
        heroImage: '',
        bgImage: '',
        imageUrl: '',
        benefits: [],
        useCases: '',
        tags: [],
        published: true,
        order: 0,
      }
    case 'reviews':
      return {
        id: '',
        headline: '',
        body: '',
        author: '',
        role: '',
        avatarUrl: '',
        rating: 5,
        order: 0,
        published: true,
      }
    case 'blog-posts':
      return {
        id: '',
        slug: '',
        title: '',
        excerpt: '',
        content: '',
        imageUrl: '',
        tags: [],
        published: true,
      }
  }
}

export default function VisualEditor({
  initialSlides,
  initialProjects,
  initialReviews,
  initialPosts,
}: {
  initialSlides: HeroSlide[]
  initialProjects: DbProject[]
  initialReviews: Review[]
  initialPosts: BlogPost[]
}) {
  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>(initialSlides)
  const [projects, setProjects] = useState<DbProject[]>(initialProjects)
  const [reviews, setReviews] = useState<Review[]>(initialReviews)
  const [articles, setArticles] = useState<BlogPost[]>(initialPosts)

  const [activeHero, setActiveHero] = useState(0)
  const [panel, setPanel] = useState<PanelState | null>(null)

  const heroPreview: HeroSlideData[] = useMemo(
    () =>
      heroSlides.map((s) => ({
        imageUrl: s.imageUrl,
        imageAlt: s.imageAlt ?? undefined,
        subtitle: s.subtitle ?? undefined,
      })),
    [heroSlides]
  )

  const articleItems: ArticleItem[] = useMemo(
    () =>
      articles.map((a, i) => ({
        id: a.id,
        title: a.title,
        excerpt: a.excerpt ?? '',
        readTime: '',
        link: '/blog',
        order: i,
      })),
    [articles]
  )

  function openEdit(entity: Entity, data: Record<string, unknown>) {
    setPanel({ entity, mode: 'edit', data })
  }

  function openNew(entity: Entity) {
    setPanel({ entity, mode: 'new', data: blankFor(entity) })
  }

  function upsert<T extends { id: string }>(list: T[], saved: T): T[] {
    const exists = list.some((x) => x.id === saved.id)
    const next = exists ? list.map((x) => (x.id === saved.id ? saved : x)) : [...list, saved]
    return [...next].sort((a, b) => ((a as { order?: number }).order ?? 0) - ((b as { order?: number }).order ?? 0))
  }

  function applySaved(entity: Entity, saved: Record<string, unknown>) {
    if (entity === 'hero-slides') setHeroSlides((l) => upsert(l, saved as unknown as HeroSlide))
    if (entity === 'projects') setProjects((l) => upsert(l, saved as unknown as DbProject))
    if (entity === 'reviews') setReviews((l) => upsert(l, saved as unknown as Review))
    if (entity === 'blog-posts') setArticles((l) => upsert(l, saved as unknown as BlogPost))
    setPanel(null)
  }

  function applyDeleted(entity: Entity, id: string) {
    if (entity === 'hero-slides') setHeroSlides((l) => l.filter((x) => x.id !== id))
    if (entity === 'projects') setProjects((l) => l.filter((x) => x.id !== id))
    if (entity === 'reviews') setReviews((l) => l.filter((x) => x.id !== id))
    if (entity === 'blog-posts') setArticles((l) => l.filter((x) => x.id !== id))
    setPanel(null)
  }

  return (
    <div className={styles.editor}>
      <div className={styles.toolbar}>
        <div>
          <a href="/admin" className={styles.backLink}>
            ← В админку
          </a>
          <h1 className={styles.title}>Визуальный редактор</h1>
          <p className={styles.subtitle}>
            Страница отрисована как на сайте. Кликните по любому блоку, чтобы открыть настройки. Слайды
            героя переключаются точками.
          </p>
        </div>
        <div className={styles.addGroup}>
          <button type="button" className={styles.addBtn} onClick={() => openNew('hero-slides')}>
            + Слайд
          </button>
          <button type="button" className={styles.addBtn} onClick={() => openNew('projects')}>
            + Проект
          </button>
          <button type="button" className={styles.addBtn} onClick={() => openNew('reviews')}>
            + Отзыв
          </button>
          <button type="button" className={styles.addBtn} onClick={() => openNew('blog-posts')}>
            + Статью
          </button>
        </div>
      </div>

      <div className={styles.pageCanvas}>
        {heroSlides.length === 0 ? (
          <div className={styles.empty}>
            <p>Пока нет ни одного слайда.</p>
            <button type="button" className={styles.addBtn} onClick={() => openNew('hero-slides')}>
              + Создать первый слайд
            </button>
          </div>
        ) : (
          <Hero
            slides={heroPreview}
            editable
            activeIndex={activeHero}
            onActiveChange={setActiveHero}
            onEdit={() => {
              const s = heroSlides[activeHero]
              if (s) openEdit('hero-slides', s as unknown as Record<string, unknown>)
            }}
          />
        )}

        <Directions
          projects={projects.map((p) => ({
            id: p.id,
            title: p.title,
            slug: p.slug,
            subtitle: p.subtitle ?? undefined,
            imageUrl: p.imageUrl ?? undefined,
            bgImage: p.bgImage ?? undefined,
            published: p.published,
            order: p.order,
          }))}
          editable
          onEdit={(p) => {
            const full = projects.find((x) => x.id === p.id)
            if (full) openEdit('projects', full as unknown as Record<string, unknown>)
          }}
        />

        <Process />

        <Testimonials
          items={reviews.map((r) => ({
            id: r.id,
            headline: r.headline,
            body: r.body,
            author: r.author ?? '',
            role: r.role ?? '',
          }))}
          editable
          onEdit={(it) => {
            const full = reviews.find((x) => x.id === it.id)
            if (full) openEdit('reviews', full as unknown as Record<string, unknown>)
          }}
        />

        <Articles
          items={articleItems}
          editable
          onEdit={(it) => {
            const full = articles.find((a) => a.id === it.id)
            if (full) openEdit('blog-posts', full as unknown as Record<string, unknown>)
          }}
        />

        <CTA />
      </div>

      {panel && (
        <EntityPanel
          entity={panel.entity}
          fields={FIELDS[panel.entity]}
          initialData={panel.data}
          onSaved={(saved) => applySaved(panel.entity, saved)}
          onDeleted={(id) => applyDeleted(panel.entity, id)}
          onClose={() => setPanel(null)}
        />
      )}
    </div>
  )
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

function initForm(fields: FieldDef[], data: Record<string, unknown> | null): Record<string, unknown> {
  const form: Record<string, unknown> = {}
  for (const field of fields) {
    const value = data?.[field.name]
    if (field.type === 'tags') {
      form[field.name] = Array.isArray(value) ? (value as string[]).join(', ') : typeof value === 'string' ? value : ''
    } else if (field.type === 'checkbox') {
      form[field.name] = Boolean(value)
    } else if (field.type === 'number') {
      form[field.name] = value == null ? '' : Number(value)
    } else {
      form[field.name] = value == null ? '' : value
    }
  }
  return form
}

function EntityPanel({
  entity,
  fields,
  initialData,
  onSaved,
  onDeleted,
  onClose,
}: {
  entity: string
  fields: FieldDef[]
  initialData: Record<string, unknown>
  onSaved: (saved: Record<string, unknown>) => void
  onDeleted: (id: string) => void
  onClose: () => void
}) {
  const isEdit = Boolean(initialData?.id)
  const [form, setForm] = useState<Record<string, unknown>>(() => initForm(fields, initialData))
  const [files, setFiles] = useState<Record<string, File>>({})
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  function setField(name: string, value: unknown) {
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  async function submit() {
    setError('')
    setSaving(true)
    try {
      const payload: Record<string, unknown> = {}
      for (const field of fields) {
        if (field.type === 'file') {
          if (files[field.name]) {
            payload[field.name] = await uploadFile(files[field.name])
          } else if (form[field.name]) {
            payload[field.name] = form[field.name]
          }
          continue
        }
        if (field.type === 'tags') {
          const raw = typeof form[field.name] === 'string' ? (form[field.name] as string) : ''
          payload[field.name] = raw
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean)
          continue
        }
        if (field.type === 'number') {
          const raw = form[field.name]
          payload[field.name] = raw === '' || raw == null ? undefined : Number(raw)
          continue
        }
        if (field.type === 'checkbox') {
          payload[field.name] = Boolean(form[field.name])
          continue
        }
        payload[field.name] = form[field.name] ?? ''
      }

      const url = isEdit ? `/api/${entity}/${initialData.id}` : `/api/${entity}`
      const method = isEdit ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const resData = await res.json().catch(() => ({}))
        throw new Error(resData.error || resData.details || 'Не удалось сохранить')
      }

      const saved: Record<string, unknown> = await res.json().then((r) => r.data)
      onSaved(saved)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Что-то пошло не так')
    } finally {
      setSaving(false)
    }
  }

  async function remove() {
    if (!confirm('Удалить этот элемент?')) return
    setSaving(true)
    try {
      const res = await fetch(`/api/${entity}/${initialData.id}`, { method: 'DELETE' })
      if (!res.ok) {
        const resData = await res.json().catch(() => ({}))
        throw new Error(resData.error || 'Не удалось удалить')
      }
      onDeleted(initialData.id as string)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось удалить')
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <div className={styles.panelBackdrop} onClick={onClose} />
      <aside className={styles.panel}>
        <div className={styles.panelHeader}>
          <h2>{isEdit ? 'Редактировать' : 'Новый элемент'}</h2>
          <button type="button" className={styles.panelClose} onClick={onClose} aria-label="Закрыть">
            ×
          </button>
        </div>

        <div className={styles.panelBody}>
          {fields.map((field) => {
            const value = form[field.name]
            const currentUrl = typeof value === 'string' ? value : ''

            if (field.type === 'file') {
              return (
                <div className={styles.group} key={field.name}>
                  <label>{field.label}</label>
                  {(files[field.name] || currentUrl) && (
                    <img
                      src={files[field.name] ? URL.createObjectURL(files[field.name]) : currentUrl}
                      alt={field.label}
                      className={styles.preview}
                    />
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setFiles((prev) => ({ ...prev, [field.name]: (e.target.files?.[0] ?? undefined) as File }))}
                  />
                </div>
              )
            }

            if (field.type === 'textarea') {
              return (
                <div className={styles.group} key={field.name}>
                  <label>{field.label}</label>
                  <textarea
                    value={typeof value === 'string' ? value : ''}
                    onChange={(e) => setField(field.name, e.target.value)}
                  />
                </div>
              )
            }

            if (field.type === 'checkbox') {
              return (
                <div className={styles.group} key={field.name}>
                  <label className={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      checked={Boolean(value)}
                      onChange={(e) => setField(field.name, e.target.checked)}
                    />
                    {field.label}
                  </label>
                </div>
              )
            }

            if (field.type === 'number') {
              return (
                <div className={styles.group} key={field.name}>
                  <label>{field.label}</label>
                  <input
                    type="number"
                    value={typeof value === 'number' || typeof value === 'string' ? String(value) : ''}
                    onChange={(e) => setField(field.name, e.target.value)}
                  />
                </div>
              )
            }

            return (
              <div className={styles.group} key={field.name}>
                <label>{field.label}</label>
                <input
                  type="text"
                  value={typeof value === 'string' ? value : ''}
                  onChange={(e) => setField(field.name, e.target.value)}
                />
              </div>
            )
          })}

          {error && <div className={styles.panelError}>{error}</div>}
        </div>

        <div className={styles.panelFooter}>
          {isEdit && (
            <button type="button" className={styles.deleteBtn} disabled={saving} onClick={remove}>
              Удалить
            </button>
          )}
          <div className={styles.panelFooterRight}>
            <button type="button" className={styles.cancelBtn} onClick={onClose} disabled={saving}>
              Отмена
            </button>
            <button type="button" className={styles.saveBtn} onClick={submit} disabled={saving}>
              {saving ? 'Сохранение...' : 'Сохранить'}
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}
