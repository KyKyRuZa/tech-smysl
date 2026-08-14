import { verifySession } from '@/lib/auth/session'
import { redirect } from 'next/navigation'
import AdminForm, { type FieldDef, type TranslationSection } from '@/components/admin/AdminForm'
import styles from '../../admin.module.css'

const baseFields: FieldDef[] = [
  { name: 'avatarUrl', label: 'Аватар', type: 'file' },
  { name: 'rating', label: 'Оценка (1-5)', type: 'number' },
  { name: 'order', label: 'Порядок', type: 'number' },
  { name: 'published', label: 'Опубликовано', type: 'checkbox' },
]

const translationSections: TranslationSection[] = [
  {
    locale: 'ru',
    label: 'RU',
    fields: [
      { name: 'headline', label: 'Заголовок', type: 'text', required: true },
      { name: 'body', label: 'Текст отзыва', type: 'textarea', required: true },
      { name: 'author', label: 'Автор', type: 'text' },
      { name: 'role', label: 'Должность', type: 'text' },
    ],
  },
  {
    locale: 'en',
    label: 'EN',
    fields: [
      { name: 'headline', label: 'Headline', type: 'text', required: true },
      { name: 'body', label: 'Review text', type: 'textarea', required: true },
      { name: 'author', label: 'Author', type: 'text' },
      { name: 'role', label: 'Role', type: 'text' },
    ],
  },
]

export default async function NewReviewPage() {
  const session = await verifySession()
  if (!session) redirect('/login')

  return (
    <div>
      <div className={styles.adminHeader}>
        <h1>Новый отзыв</h1>
      </div>
      <div className={styles.adminCard}>
        <AdminForm
          entity="reviews"
          fields={baseFields}
          translationSections={translationSections}
          redirectPath="/admin/reviews"
        />
      </div>
    </div>
  )
}
