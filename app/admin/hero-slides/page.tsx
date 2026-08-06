import { verifySession } from '@/lib/auth/session'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import styles from '../admin.module.css'

export default async function HeroSlidesPage() {
  const session = await verifySession()
  if (!session) redirect('/login')

  const slides = await prisma.heroSlide.findMany({ orderBy: { order: 'asc' } })

  return (
    <div>
      <div className={styles.adminHeader}>
        <h1>Слайды</h1>
        <a href="/admin/hero-slides/new" className={`${styles.adminBtn} ${styles.adminBtnPrimary}`}>
          Новый слайд
        </a>
      </div>
      <div className={styles.adminCard}>
        {slides.length === 0 ? (
          <div className={styles.adminEmpty}>
            <p>Слайдов пока нет.</p>
            <a href="/admin/hero-slides/new" className={`${styles.adminBtn} ${styles.adminBtnPrimary}`}>
              Создать первый слайд
            </a>
          </div>
        ) : (
          <div className={styles.adminTableWrap}>
            <table className={styles.adminTable}>
              <thead>
                <tr>
                  <th>Alt</th>
                  <th>Заголовок</th>
                  <th>Статус</th>
                  <th>Действия</th>
                </tr>
              </thead>
              <tbody>
                {slides.map((slide) => (
                  <tr key={slide.id}>
                    <td className={styles.adminTableTitle}>{slide.imageAlt ?? '—'}</td>
                    <td>{slide.title ?? '—'}</td>
                    <td>
                      <span
                        className={`${styles.adminBadge} ${slide.published ? styles.adminBadgePublished : styles.adminBadgeDraft}`}
                      >
                        {slide.published ? 'Опубликован' : 'Черновик'}
                      </span>
                    </td>
                    <td>
                      <a
                        href={`/admin/hero-slides/${slide.id}/edit`}
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
