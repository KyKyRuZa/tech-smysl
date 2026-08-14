import { isValidLocale } from '@/lib/i18n/get-locale'
import { notFound } from 'next/navigation'
import { Metadata } from 'next'

type Props = {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  if (!locale || !isValidLocale(locale)) return {}

  const titles: Record<string, string> = {
    ru: 'Об агентстве — Техсмысл',
    en: 'About us — Tech Smysl',
  }

  return {
    title: titles[locale] ?? 'About us',
    description: locale === 'ru'
      ? 'IT-компания полного цикла: разработка сайтов, мобильных приложений, 3D-визуализации и AR-решений.'
      : 'Full-cycle IT company: websites, mobile apps, 3D visualization and AR solutions.',
  }
}

export default async function AboutPage({ params }: Props) {
  const { locale } = await params
  if (!locale || !isValidLocale(locale)) notFound()

  return (
    <section className="py-20">
      <div className="container">
        <h1 className="text-4xl font-bold mb-6">
          {locale === 'ru' ? 'Об агентстве' : 'About us'}
        </h1>
        <p className="text-lg text-gray-600 mb-4">
          {locale === 'ru'
            ? 'Техсмысл — IT-компания полного цикла. Мы разрабатываем веб-сайты, мобильные приложения, 3D-визуализации и AR-решения.'
            : 'Tech Smysl is a full-cycle IT company. We develop websites, mobile apps, 3D visualizations and AR solutions.'}
        </p>
        <p className="text-lg text-gray-600">
          {locale === 'ru'
            ? 'Более 50 успешных проектов, +30 IT-решений ежегодно и гарантия 99,9% аптайма.'
            : 'More than 50 successful projects, +30 IT solutions yearly and 99.9% uptime guarantee.'}
        </p>
      </div>
    </section>
  )
}
