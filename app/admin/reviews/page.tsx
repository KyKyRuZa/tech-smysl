import { verifySession } from '@/lib/auth/session'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import styles from '../admin.module.css'

export default async function ReviewsPage() {
  const session = await verifySession()
  if (!session) redirect('/login')

  const reviews = await prisma.review.findMany({ orderBy: { order: 'asc' } })

  return (
    <div>
      <div className={styles.adminHeader}>
        <h1>Отзывы</h1>
        <a href="/admin/reviews/new" className={`${styles.adminBtn} ${styles.adminBtnPrimary}`}>
          Новый отзыв
        </a>
      </div>
      <div className={styles.adminCard}>
        {reviews.length === 0 ? (
          <div className={styles.adminEmpty}>
            <p>Отзывов пока нет.</p>
            <a href="/admin/reviews/new" className={`${styles.adminBtn} ${styles.adminBtnPrimary}`}>
              Создать первый отзыв
            </a>
          </div>
        ) : (
          <div className={styles.adminTableWrap}>
            <table className={styles.adminTable}>
              <thead>
                <tr>
                  <th>Заголовок</th>
                  <th>Автор</th>
                  <th>Статус</th>
                  <th>Действия</th>
                </tr>
              </thead>
              <tbody>
                {reviews.map((review) => (
                  <tr key={review.id}>
                    <td className={styles.adminTableTitle}>{review.headline}</td>
                    <td>{review.author ?? '—'}</td>
                    <td>
                      <span
                        className={`${styles.adminBadge} ${review.published ? styles.adminBadgePublished : styles.adminBadgeDraft}`}
                      >
                        {review.published ? 'Опубликован' : 'Черновик'}
                      </span>
                    </td>
                    <td>
                      <a
                        href={`/admin/reviews/${review.id}/edit`}
                        className={`${styles.adminBtn} ${styles.adminBtnSecondary} ${styles.adminBtnSm}`}
                      >
                        Редактировать
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
