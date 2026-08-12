export const locales = ['ru', 'en'] as const
export type Locale = (typeof locales)[number]
export const defaultLocale: Locale = 'ru'

export function isValidLocale(locale: string): locale is Locale {
  return locales.includes(locale as Locale)
}

export function getLocaleFromPath(pathname: string): Locale | null {
  const segments = pathname.split('/')
  return isValidLocale(segments[1]) ? (segments[1] as Locale) : null
}
