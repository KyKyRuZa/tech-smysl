import { verifySession } from '@/lib/auth/session'
import styles from './admin.module.css'

export default async function AdminPage() {
  const session = await verifySession()

  return (
    <div className={styles.adminCard} style={{ maxWidth: 480, width: '100%' }}>
      <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 16 }}>Админ панель</h2>
      <p style={{ color: 'var(--gray)', marginBottom: 8 }}>Добро пожаловать, {session.email}</p>
      <p style={{ color: 'var(--gray)', fontSize: 14 }}>Роль: {session.role}</p>
    </div>
  )
}