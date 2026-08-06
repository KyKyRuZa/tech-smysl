'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import styles from './admin.module.css'

function NavIcon({ name }: { name: string }) {
  const common = {
    width: 18,
    height: 18,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  }
  switch (name) {
    case 'dashboard':
      return (
        <svg {...common}>
          <rect x="3" y="3" width="7" height="7" />
          <rect x="14" y="3" width="7" height="7" />
          <rect x="14" y="14" width="7" height="7" />
          <rect x="3" y="14" width="7" height="7" />
        </svg>
      )
    case 'blog':
      return (
        <svg {...common}>
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
        </svg>
      )
    case 'projects':
      return (
        <svg {...common}>
          <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
        </svg>
      )
    case 'reviews':
      return (
        <svg {...common}>
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      )
    case 'slides':
      return (
        <svg {...common}>
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <path d="M3 9h18M9 21V9" />
        </svg>
      )
    case 'editor':
      return (
        <svg {...common}>
          <path d="M12 20h9" />
          <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
        </svg>
      )
    default:
      return null
  }
}

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  const navItems = [
    { href: '/admin', label: 'Дашборд', icon: 'dashboard' },
    { href: '/admin/blog-posts', label: 'Статьи', icon: 'blog' },
    { href: '/admin/projects', label: 'Проекты', icon: 'projects' },
    { href: '/admin/reviews', label: 'Отзывы', icon: 'reviews' },
    { href: '/admin/hero-slides', label: 'Слайды', icon: 'slides' },
    { href: '/admin/edit', label: 'Редактор', icon: 'editor' },
  ]

  return (
    <>
      <div className={styles.adminMobileBar}>
        <button
          type="button"
          className={styles.adminMobileToggle}
          onClick={() => setOpen(true)}
          aria-label="Открыть меню"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
        <h2>Админка</h2>
      </div>

      {open && <div className={styles.adminBackdrop} onClick={() => setOpen(false)} />}

      <div className={styles.adminLayout}>
        <aside className={`${styles.adminSidebar} ${open ? styles.open : ''}`}>
          <div className={styles.adminSidebarHeader}>
            <div className={styles.adminLogo}>S</div>
          </div>
          <nav className={styles.adminNav}>
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className={styles.adminNavItem}
                data-active={
                  item.href === '/admin'
                    ? pathname === '/admin' || pathname === '/admin/'
                      ? 'true'
                      : undefined
                    : pathname.startsWith(item.href)
                      ? 'true'
                      : undefined
                }
                onClick={() => setOpen(false)}
              >
                <span className={styles.adminNavIcon}>
                  <NavIcon name={item.icon} />
                </span>
                {item.label}
              </a>
            ))}
          </nav>
          <div className={styles.adminSidebarFooter}>
            <form action="/api/auth/logout" method="POST">
              <button type="submit" className={styles.adminLogoutBtn}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
                Выход
              </button>
            </form>
          </div>
        </aside>
        <main className={styles.adminMain}>{children}</main>
      </div>
    </>
  )
}
