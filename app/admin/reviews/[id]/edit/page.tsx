import { verifySession } from '@/lib/auth/session'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import AdminForm, { type FieldDef, type TranslationSection } from '@/components/admin/AdminForm'
import styles from '../../../admin.module.css'

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

export default async function ReviewEditPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await verifySession()
  if (!session) redirect('/login')

  const { id } = await params
  const review = await prisma.review.findUnique({
    where: { id },
    include: { translations: true },
  })

  const initialTranslations = review?.translations.reduce<Record<string, Record<string, unknown>>>(
    (acc, t) => {
      acc[t.locale] = {
        headline: t.headline ?? '',
        body: t.body ?? '',
        author: t.author ?? '',
        role: t.role ?? '',
      }
      return acc
    },
    {}
  )

  return (
    <div>
      <div className={styles.adminHeader}>
        <h1>{review ? 'Редактировать отзыв' : 'Новый отзыв'}</h1>
      </div>
      <div className={styles.adminCard}>
        {review ? (
          <AdminForm
            entity="reviews"
            fields={baseFields}
            initialData={review as unknown as Record<string, unknown>}
            translationSections={translationSections}
            initialTranslations={initialTranslations}
            redirectPath="/admin/reviews"
          />
        ) : (
          <p className={styles.adminEmpty}>Отзыв не найден.</p>
        )}
      </div>
    </div>
  )
}
