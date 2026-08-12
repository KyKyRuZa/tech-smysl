import Image from 'next/image'
import Link from 'next/link'
import { cookies } from 'next/headers'
import { decrypt } from '@/lib/auth/session'
import LangSwitch from './LangSwitch'
import styles from './Header.module.css'

export default async function Header() {
  const cookieStore = await cookies()
  const session = cookieStore.get('session')?.value
  const payload = decrypt(session)
  const isAuthenticated = !!payload?.userId

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <Link href="/" className={styles.logo}>
          <Image src="/logo.svg" alt="Tech Smysl" width={187} height={42} priority />
        </Link>

        <nav className={styles.nav}>
          <Link href="/about" className={styles.navLink}>
            Об агентстве
          </Link>
          <Link href="/projects" className={styles.navLink}>
            Портфолио
          </Link>
          <Link href="/#discuss" className={styles.navLink}>
            Обсудить проект
          </Link>
        </nav>

        <div className={styles.rightSection}>
          <LangSwitch />
          <a href="tel:+78005553535" className={styles.phone}>
            +7 800 555 35 35
          </a>
          {isAuthenticated && (
            <Link href="/admin" className={styles.settingsButton} aria-label="Settings">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
              </svg>
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
