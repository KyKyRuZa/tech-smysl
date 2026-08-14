import { verifySession } from '@/lib/auth/session'
import { redirect } from 'next/navigation'
import AdminForm, { type FieldDef, type TranslationSection } from '@/components/admin/AdminForm'
import styles from '../../admin.module.css'

const baseFields: FieldDef[] = [
  { name: 'imageUrl', label: 'Изображение', type: 'file' },
  { name: 'published', label: 'Опубликовано', type: 'checkbox' },
]

const translationSections: TranslationSection[] = [
  {
    locale: 'ru',
    label: 'RU',
    fields: [
      { name: 'title', label: 'Заголовок', type: 'text', required: true },
      { name: 'slug', label: 'Slug', type: 'text', required: true },
      { name: 'excerpt', label: 'Анонс', type: 'textarea' },
      { name: 'content', label: 'Содержание', type: 'textarea', required: true },
      { name: 'tags', label: 'Теги (через запятую)', type: 'tags' },
    ],
  },
  {
    locale: 'en',
    label: 'EN',
    fields: [
      { name: 'title', label: 'Title', type: 'text', required: true },
      { name: 'slug', label: 'Slug', type: 'text', required: true },
      { name: 'excerpt', label: 'Excerpt', type: 'textarea' },
      { name: 'content', label: 'Content', type: 'textarea', required: true },
      { name: 'tags', label: 'Tags (comma separated)', type: 'tags' },
    ],
  },
]

export default async function NewBlogPostPage() {
  const session = await verifySession()
  if (!session) redirect('/login')

  return (
    <div>
      <div className={styles.adminHeader}>
        <h1>Новая статья</h1>
      </div>
      <div className={styles.adminCard}>
        <AdminForm
          entity="blog-posts"
          fields={baseFields}
          translationSections={translationSections}
          redirectPath="/admin/blog-posts"
        />
      </div>
    </div>
  )
}
