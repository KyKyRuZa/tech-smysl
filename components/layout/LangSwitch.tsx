'use client'

import { usePathname, useRouter } from 'next/navigation'
import { defaultLocale, isValidLocale } from '@/lib/i18n/get-locale'
import styles from './Header.module.css'

function getLocaleFromPath(pathname: string): string | null {
  const segments = pathname.split('/')
  return isValidLocale(segments[1]) ? segments[1] : null
}

function setLocaleCookie(locale: string) {
  if (typeof document === 'undefined') return
  document.cookie = `NEXT_LOCALE=${locale}; path=/; max-age=31536000; SameSite=Lax`
}

export default function LangSwitch() {
  const pathname = usePathname()
  const router = useRouter()

  const localeFromPath = getLocaleFromPath(pathname)
  const cookieLocale =
    typeof document !== 'undefined'
      ? document.cookie.split('; ').find((row) => row.startsWith('NEXT_LOCALE='))?.split('=')[1] ?? null
      : null
  const currentLocale = localeFromPath ?? (cookieLocale && isValidLocale(cookieLocale) ? cookieLocale : defaultLocale)

  const switchTo = (target: string) => {
    const current = getLocaleFromPath(pathname) ?? currentLocale
    if (target === current) return
    setLocaleCookie(target)
    const segments = pathname.split('/')
    segments[1] = target
    const newUrl = segments.join('/')
    router.push(newUrl || `/${target}`)
  }

  return (
    <div className={styles.langSwitch}>
      <button
        type="button"
        onClick={() => switchTo('ru')}
        className={currentLocale === 'ru' ? styles.langActive : styles.langInactive}
        aria-current={currentLocale === 'ru' ? 'true' : undefined}
      >
        Рус
      </button>
      <span aria-hidden="true">|</span>
      <button
        type="button"
        onClick={() => switchTo('en')}
        className={currentLocale === 'en' ? styles.langActive : styles.langInactive}
        aria-current={currentLocale === 'en' ? 'true' : undefined}
      >
        Eng
      </button>
    </div>
  )
}
