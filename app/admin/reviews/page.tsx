import { verifySession } from '@/lib/auth/session'
import { redirect } from 'next/navigation'
import { getAdminReviews } from '@/lib/admin-queries'
import RowActions from '@/components/admin/RowActions'
import styles from '../admin.module.css'

export default async function ReviewsPage() {
  const session = await verifySession()
  if (!session) redirect('/login')

  const reviews = await getAdminReviews()

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
                      <RowActions entity="reviews" id={review.id} redirectPath="/admin/reviews" />
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
