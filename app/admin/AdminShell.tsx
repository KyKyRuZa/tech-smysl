'use client'

import { useLayoutEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import NavIcon from '@/components/admin/NavIcon'
import styles from './admin.module.css'
import { DialogProvider } from '@/components/admin/DialogProvider'

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  const pathname = usePathname()

  useLayoutEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Reading localStorage on mount is a legitimate pattern
    setCollapsed(window.localStorage.getItem('admin-sidebar-collapsed') === 'true')
  }, [])

  const toggleCollapsed = () => {
    setCollapsed((prev) => {
      const next = !prev
      window.localStorage.setItem('admin-sidebar-collapsed', String(next))
      return next
    })
  }

  const navItems = [
    { href: '/admin', label: 'Дашборд', icon: 'dashboard' },
    { href: '/admin/blog-posts', label: 'Статьи', icon: 'blog' },
    { href: '/admin/projects', label: 'Проекты', icon: 'projects' },
    { href: '/admin/reviews', label: 'Отзывы', icon: 'reviews' },
    { href: '/admin/hero-slides', label: 'Слайды', icon: 'slides' },
    { href: '/admin/applications', label: 'Заявки', icon: 'applications' },
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

      <div className={`${styles.adminLayout} ${collapsed ? styles.collapsed : ''}`}>
        <aside className={`${styles.adminSidebar} ${open ? styles.open : ''} ${collapsed ? styles.collapsed : ''}`}>
          <div className={styles.adminSidebarHeader}>
            <Link href="/" className={styles.adminLogoLink}>
              <Image src="/logo.svg" alt="Tech Smysl" className={styles.adminLogoImg} width={187} height={42} priority />
            </Link>
            <button
              type="button"
              className={styles.adminCollapseBtn}
              aria-label={collapsed ? 'Развернуть сайдбар' : 'Свернуть сайдбар'}
              onClick={toggleCollapsed}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="miter">
                {collapsed ? (
                  <path d="M9 18l6-6-6-6" />
                ) : (
                  <path d="M15 18l-6-6 6-6" />
                )}
              </svg>
            </button>
          </div>
          <nav className={styles.adminNav}>
            {navItems.map((item) => (
              <Link
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
                <span className={styles.adminNavLabel}>{item.label}</span>
              </Link>
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
                <span className={styles.adminLogoutLabel}>Выход</span>
              </button>
            </form>
          </div>
        </aside>
        <main className={styles.adminMain}>
          <DialogProvider>{children}</DialogProvider>
        </main>
      </div>
    </>
  )
}
