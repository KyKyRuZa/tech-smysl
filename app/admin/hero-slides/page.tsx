import { verifySession } from '@/lib/auth/session'
import { redirect } from 'next/navigation'
import { getAdminHeroSlides } from '@/lib/admin-queries'
import Link from 'next/link'
import RowActions from '@/components/admin/RowActions'
import styles from '../admin.module.css'

export default async function HeroSlidesPage() {
  const session = await verifySession()
  if (!session) redirect('/login')

  const slides = await getAdminHeroSlides()

  return (
    <div>
      <div className={styles.adminHeader}>
        <h1>Слайды</h1>
        <Link href="/admin/hero-slides/new" className={`${styles.adminBtn} ${styles.adminBtnPrimary}`}>
          Новый слайд
        </Link>
      </div>
      <div className={styles.adminCard}>
        {slides.length === 0 ? (
          <div className={styles.adminEmpty}>
            <p>Слайдов пока нет.</p>
            <Link href="/admin/hero-slides/new" className={`${styles.adminBtn} ${styles.adminBtnPrimary}`}>
              Создать первый слайд
            </Link>
          </div>
        ) : (
          <div className={styles.adminTableWrap}>
            <table className={styles.adminTable}>
              <thead>
                <tr>
                  <th>Alt</th>
                  <th>Заголовок (RU)</th>
                  <th>Заголовок (EN)</th>
                  <th>Статус</th>
                  <th>Действия</th>
                </tr>
              </thead>
              <tbody>
                {slides.map((slide) => {
                  const ru = slide.translations.find((t) => t.locale === 'ru')
                  const en = slide.translations.find((t) => t.locale === 'en')
                  return (
                    <tr key={slide.id}>
                      <td className={styles.adminTableTitle}>{slide.imageAlt ?? '—'}</td>
                      <td>{ru?.title ?? '—'}</td>
                      <td>{en?.title ?? '—'}</td>
                      <td>
                        <span
                          className={`${styles.adminBadge} ${slide.published ? styles.adminBadgePublished : styles.adminBadgeDraft}`}
                        >
                          {slide.published ? 'Опубликован' : 'Черновик'}
                        </span>
                      </td>
                      <td>
                        <RowActions entity="hero-slides" id={slide.id} redirectPath="/admin/hero-slides" />
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
