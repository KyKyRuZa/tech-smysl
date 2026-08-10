import { verifySession } from '@/lib/auth/session'
import Link from 'next/link'
import { getAdminApplications, getAdminApplicationsCount } from '@/lib/admin-queries'
import styles from './admin.module.css'

const quickLinks = [
  { href: '/admin/blog-posts', label: 'Статьи', desc: 'Управление блогом' },
  { href: '/admin/projects', label: 'Проекты', desc: 'Кейсы и работы' },
  { href: '/admin/reviews', label: 'Отзывы', desc: 'Отзывы клиентов' },
  { href: '/admin/hero-slides', label: 'Слайды', desc: 'Главный экран' },
  { href: '/admin/applications', label: 'Заявки', desc: 'Входящие лиды' },
]

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
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

export default async function AdminPage() {
  const session = await verifySession()
  const [applications, applicationsCount] = await Promise.all([
    getAdminApplications(),
    getAdminApplicationsCount(),
  ])

  return (
    <div>
      <div className={styles.adminHeader}>
        <div>
          <h1>Дашборд</h1>
          <p className={styles.adminHeaderSub}>Добро пожаловать, {session.email}</p>
        </div>
      </div>

      <div className={styles.adminCard}>
        <div className={styles.adminCardHeader}>
          <h2>Роль: {session.role}</h2>
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: 12,
          }}
        >
          {quickLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              style={{
                display: 'block',
                padding: '16px 18px',
                borderRadius: 10,
                border: '1px solid var(--border)',
                background: 'var(--white)',
                textDecoration: 'none',
                transition: 'border-color 0.15s ease, background 0.15s ease',
              }}
              className={styles.adminQuickLink}
            >
              <div style={{ fontWeight: 600, fontSize: 15, color: 'var(--black)' }}>{link.label}</div>
              <div style={{ fontSize: 13, color: 'var(--gray)', marginTop: 4 }}>{link.desc}</div>
            </a>
          ))}
        </div>
      </div>

      <div className={styles.adminCard}>
        <div className={styles.adminCardHeader}>
          <h2>Последние заявки</h2>
          <Link href="/admin/applications" className={`${styles.adminBtn} ${styles.adminBtnSecondary} ${styles.adminBtnSm}`}>
            Все заявки ({applicationsCount})
          </Link>
        </div>
        {applications.length === 0 ? (
          <p style={{ color: 'var(--gray)', fontSize: 14, margin: 0 }}>Заявок пока нет.</p>
        ) : (
          <div className={styles.adminTableWrap}>
            <table className={styles.adminTable}>
              <thead>
                <tr>
                  <th>Имя</th>
                  <th>Email</th>
                  <th>Услуга</th>
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
                    <td>{app.service ? (SERVICE_LABELS[app.service] ?? app.service) : '—'}</td>
                    <td style={{ whiteSpace: 'nowrap', color: 'var(--gray)' }}>{formatDate(app.createdAt)}</td>
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
