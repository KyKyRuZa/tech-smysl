import Link from 'next/link'
import { getTranslations } from '@/lib/i18n/translations'
import styles from './Footer.module.css'

interface FooterProps {
  locale: string
}

export default function Footer({ locale }: FooterProps) {
  const t = getTranslations(locale as 'ru' | 'en')
  const currentYear = new Date().getFullYear()

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.top}>
          <div className={styles.brand}>
            <p className={styles.brandName}>{t.footer.brandName}</p>
            <p className={styles.brandDesc}>{t.footer.brandDesc}</p>
          </div>

          <div>
            <p className={styles.navTitle}>{t.footer.navTitle}</p>
            <nav className={styles.navList}>
              <Link href={`/${locale}/about`} className={styles.navLink}>
                {t.footer.about}
              </Link>
              <Link href={`/${locale}/projects`} className={styles.navLink}>
                {t.footer.projects}
              </Link>
              <Link href={`/${locale}/#discuss`} className={styles.navLink}>
                {t.footer.discuss}
              </Link>
            </nav>
          </div>

          <div>
            <p className={styles.contactsTitle}>{t.footer.contactsTitle}</p>
            <div className={styles.contactsList}>
              <a href={`tel:+78005553535`} className={styles.contactLink}>
                {t.footer.phone}
              </a>
              <a href={`mailto:${t.footer.email}`} className={styles.contactLink}>
                {t.footer.email}
              </a>
              <span className={styles.address}>{t.footer.address}</span>
            </div>
          </div>
        </div>

        <div className={styles.bottom}>
          <p className={styles.copyright}>
            &copy; {currentYear} {t.footer.brandName}. {t.footer.copyright}
          </p>
        </div>
      </div>
    </footer>
  )
}
