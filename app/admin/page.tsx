import { verifySession } from '@/lib/auth/session'
import styles from './admin.module.css'

const quickLinks = [
  { href: '/admin/blog-posts', label: 'Статьи', desc: 'Управление блогом' },
  { href: '/admin/projects', label: 'Проекты', desc: 'Кейсы и работы' },
  { href: '/admin/reviews', label: 'Отзывы', desc: 'Отзывы клиентов' },
  { href: '/admin/hero-slides', label: 'Слайды', desc: 'Главный экран' },
]

export default async function AdminPage() {
  const session = await verifySession()

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
    </div>
  )
}
