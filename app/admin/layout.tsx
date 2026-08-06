import type { Metadata } from 'next'
import styles from './admin.module.css'
import '../globals.css'

export const metadata: Metadata = {
  title: 'Админ панель',
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className={styles.adminLayout}>
      <aside className={styles.adminSidebar}>
        <div className={styles.adminSidebarHeader}>
          <h2>Админка</h2>
        </div>
        <nav className={styles.adminNav}>
          <a href="/admin" className={styles.adminNavItem}>
            Дашборд
          </a>
          <a href="/admin/blog-posts" className={styles.adminNavItem}>
            Статьи
          </a>
          <a href="/admin/projects" className={styles.adminNavItem}>
            Проекты
          </a>
          <a href="/admin/reviews" className={styles.adminNavItem}>
            Отзывы
          </a>
          <a href="/admin/hero-slides" className={styles.adminNavItem}>
            Слайды
          </a>
        </nav>
        <div className={styles.adminSidebarFooter}>
          <form action="/api/auth/logout" method="POST">
            <button type="submit" className={styles.adminLogoutBtn}>
              Выход
            </button>
          </form>
        </div>
      </aside>
      <main className={styles.adminMain}>{children}</main>
    </div>
  )
}