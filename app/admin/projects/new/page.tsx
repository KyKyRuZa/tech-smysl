import { verifySession } from '@/lib/auth/session'
import { redirect } from 'next/navigation'
import AdminForm, { type FieldDef, type TranslationSection } from '@/components/admin/AdminForm'
import styles from '../../admin.module.css'

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

export default async function NewProjectPage() {
  const session = await verifySession()
  if (!session) redirect('/login')

  return (
    <div>
      <div className={styles.adminHeader}>
        <h1>Новый проект</h1>
      </div>
      <div className={styles.adminCard}>
        <AdminForm
          entity="projects"
          fields={baseFields}
          translationSections={translationSections}
          redirectPath="/admin/projects"
        />
      </div>
    </div>
  )
}
