import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { isValidLocale, getLocaleFromPath } from '@/lib/i18n/get-locale'
import LanguageSetter from '@/components/layout/LanguageSetter'

const descriptions: Record<string, string> = {
  ru: 'IT-компания полного цикла: разработка сайтов, мобильных приложений, 3D-визуализации и AR-решений. +30 проектов в год, 99,9% аптайм.',
  en: 'Full-cycle IT company: websites, mobile apps, 3D visualization and AR solutions. +30 projects yearly, 99.9% uptime.',
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  if (!locale || !isValidLocale(locale)) return {}

  return {
    title: {
      default: 'Tech Smysl',
      template: `%s | Tech Smysl`,
    },
    description: descriptions[locale],
    alternates: {
      canonical: `/${locale}`,
      languages: {
        ru: '/ru',
        en: '/en',
      },
    },
  }
}

export default async function LocaleLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode
  params: Promise<{ locale: string }>
}>) {
  const { locale } = await params
  if (!locale || !isValidLocale(locale)) notFound()

  return (
    <>
      <LanguageSetter locale={locale} />
      {children}
    </>
  )
}
