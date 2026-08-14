import { verifySession } from '@/lib/auth/session'
import type { Metadata } from 'next'
import Link from 'next/link'
import { getAdminApplications } from '@/lib/admin-queries'
import styles from '../admin.module.css'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Заявки',
}

const SERVICE_LABELS: Record<string, string> = {
  web: 'Веб-разработка',
  mobile: 'Мобильное приложение',
  ar3d: 'AR / 3D-визуализация',
  other: 'Другое',
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

export default async function AdminApplicationsPage() {
  await verifySession()
  const applications = await getAdminApplications()

  return (
    <div>
      <div className={styles.adminHeader}>
        <div>
          <h1>Заявки</h1>
          <p className={styles.adminHeaderSub}>
            Всего заявок: {applications.length}
          </p>
        </div>
      </div>

      <div className={styles.adminCard}>
        {applications.length === 0 ? (
          <div className={styles.adminEmpty}>
            <p>Заявок пока нет.</p>
             <Link href="/ru/#discuss" className={`${styles.adminBtn} ${styles.adminBtnSecondary}`}>
              Открыть форму на сайте
            </Link>
          </div>
        ) : (
          <div className={styles.adminTableWrap}>
            <table className={styles.adminTable}>
              <thead>
                <tr>
                  <th>Имя</th>
                  <th>Email</th>
                  <th>Телефон</th>
                  <th>Услуга</th>
                  <th>Сообщение</th>
                  <th>Дата</th>
                </tr>
              </thead>
              <tbody>
                {applications.map((app) => (
                  <tr key={app.id}>
                    <td className={styles.adminTableTitle}>{app.name}</td>
                    <td>
                      <a href={`mailto:${app.email}`}>{app.email}</a>
                    </td>
                    <td>{app.phone || '—'}</td>
                    <td>{app.service ? (SERVICE_LABELS[app.service] ?? app.service) : '—'}</td>
                    <td style={{ maxWidth: 320, whiteSpace: 'pre-wrap' }}>{app.message}</td>
                    <td style={{ whiteSpace: 'nowrap', color: 'var(--gray)' }}>
                      {formatDate(app.createdAt)}
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
