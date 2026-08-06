import { verifySession } from '@/lib/auth/session'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import AdminForm, { type FieldDef } from '@/components/admin/AdminForm'
import styles from '../../../admin.module.css'

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

export default async function ReviewEditPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await verifySession()
  if (!session) redirect('/login')

  const { id } = await params
  const review = await prisma.review.findUnique({ where: { id } })

  return (
    <div>
      <div className={styles.adminHeader}>
        <h1>{review ? 'Редактировать отзыв' : 'Новый отзыв'}</h1>
      </div>
      <div className={styles.adminCard}>
        {review ? (
          <AdminForm
            entity="reviews"
            fields={fields}
            initialData={review as unknown as Record<string, unknown>}
            redirectPath="/admin/reviews"
          />
        ) : (
          <p className={styles.adminEmpty}>Отзыв не найден.</p>
        )}
      </div>
    </div>
  )
}
