import { verifySession } from '@/lib/auth/session'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import AdminForm, { type FieldDef, type TranslationSection } from '@/components/admin/AdminForm'
import styles from '../../../admin.module.css'

const baseFields: FieldDef[] = [
  { name: 'heroImage', label: 'Главное изображение', type: 'file' },
  { name: 'bgImage', label: 'Фоновое изображение', type: 'file' },
  { name: 'imageUrl', label: 'Изображение', type: 'file' },
  { name: 'benefits', label: 'Преимущества (через запятую)', type: 'tags' },
  { name: 'published', label: 'Опубликовано', type: 'checkbox' },
  { name: 'order', label: 'Порядок', type: 'number' },
]

const translationSections: TranslationSection[] = [
  {
    locale: 'ru',
    label: 'RU',
    fields: [
      { name: 'title', label: 'Название', type: 'text', required: true },
      { name: 'slug', label: 'Slug', type: 'text', required: true },
      { name: 'subtitle', label: 'Подзаголовок', type: 'text' },
      { name: 'description', label: 'Описание', type: 'textarea' },
      { name: 'content', label: 'Содержание', type: 'textarea' },
      { name: 'useCases', label: 'Варианты использования', type: 'textarea' },
      { name: 'tags', label: 'Теги (через запятую)', type: 'tags' },
    ],
  },
  {
    locale: 'en',
    label: 'EN',
    fields: [
      { name: 'title', label: 'Title', type: 'text', required: true },
      { name: 'slug', label: 'Slug', type: 'text', required: true },
      { name: 'subtitle', label: 'Subtitle', type: 'text' },
      { name: 'description', label: 'Description', type: 'textarea' },
      { name: 'content', label: 'Content', type: 'textarea' },
      { name: 'useCases', label: 'Use cases', type: 'textarea' },
      { name: 'tags', label: 'Tags (comma separated)', type: 'tags' },
    ],
  },
]

export default async function ProjectEditPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await verifySession()
  if (!session) redirect('/login')

  const { id } = await params
  const project = await prisma.project.findUnique({
    where: { id },
    include: { translations: true },
  })

  const initialTranslations = project?.translations.reduce<Record<string, Record<string, unknown>>>(
    (acc, t) => {
      acc[t.locale] = {
        title: t.title ?? '',
        slug: t.slug ?? '',
        subtitle: t.subtitle ?? '',
        description: t.description ?? '',
        content: t.content ?? '',
        useCases: t.useCases ?? '',
        benefits: t.benefits ?? [],
        tags: t.tags ?? [],
      }
      return acc
    },
    {}
  )

  return (
    <div>
      <div className={styles.adminHeader}>
        <h1>{project ? 'Редактировать проект' : 'Новый проект'}</h1>
      </div>
      <div className={styles.adminCard}>
        {project ? (
          <AdminForm
            entity="projects"
            fields={baseFields}
            initialData={project as unknown as Record<string, unknown>}
            translationSections={translationSections}
            initialTranslations={initialTranslations}
            redirectPath="/admin/projects"
          />
        ) : (
          <p className={styles.adminEmpty}>Проект не найден.</p>
        )}
      </div>
    </div>
  )
}
