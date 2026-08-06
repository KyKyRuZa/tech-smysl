import { verifySession } from '@/lib/auth/session'
import { redirect } from 'next/navigation'
import styles from '../admin.module.css'

export const metadata = {
  title: 'Вход в админку',
}

export default async function AdminLoginPage() {
  const session = await verifySession()
  if (session) redirect('/admin')

  return (
    <div className={styles.adminLoginPage}>
      <div className={styles.adminLoginCard}>
        <h1>Вход в админку</h1>
        <p className={styles.adminLoginSub}>Введите свои учетные данные для входа</p>
        <form action="/api/auth/login" method="POST" className={styles.adminForm}>
          <div className={styles.adminFormGroup}>
            <label htmlFor="email">Email</label>
            <input id="email" name="email" type="email" required />
          </div>
          <div className={styles.adminFormGroup}>
            <label htmlFor="password">Пароль</label>
            <input id="password" name="password" type="password" required />
          </div>
          <button type="submit" className={`${styles.adminBtn} ${styles.adminBtnPrimary}`}>
            Войти
          </button>
        </form>
      </div>
    </div>
  )
}