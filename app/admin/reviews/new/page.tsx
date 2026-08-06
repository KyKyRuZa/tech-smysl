import { verifySession } from '@/lib/auth/session'
import { redirect } from 'next/navigation'
import AdminForm, { type FieldDef } from '@/components/admin/AdminForm'
import styles from '../../admin.module.css'

const fields: FieldDef[] = [
  { name: 'headline', label: 'Заголовок', type: 'text', required: true },
  { name: 'body', label: 'Текст отзыва', type: 'textarea', required: true },
  { name: 'author', label: 'Автор', type: 'text' },
  { name: 'role', label: 'Должность', type: 'text' },
  { name: 'avatarUrl', label: 'Аватар', type: 'file' },
  { name: 'rating', label: 'Оценка (1-5)', type: 'number' },
  { name: 'order', label: 'Порядок', type: 'number' },
  { name: 'published', label: 'Опубликовано', type: 'checkbox' },
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
        <AdminForm entity="reviews" fields={fields} redirectPath="/admin/reviews" />
      </div>
    </div>
  )
}
