import type { Metadata } from 'next'
import { Unbounded, JetBrains_Mono } from 'next/font/google'
import { isValidLocale } from '@/lib/i18n/get-locale'
import { cookies } from 'next/headers'
import './globals.css'

const unbounded = Unbounded({
  subsets: ['latin', 'cyrillic'],
  weight: ['400', '500', '600', '700', '800', '900'],
  variable: '--font-sans',
  display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'),
  title: 'Тех Смысл — IT-разработка, 3D-визуализация и AR',
  description: 'IT-компания полного цикла: разработка сайтов, мобильных приложений, 3D-визуализация и AR-решения. +30 проектов в год, 99,9% аптайм.',
  keywords: 'разработка сайтов, веб-разработка, мобильные приложения, Flutter, React, 3D-визуализация, AR, дополненная реальность, AI решения, облачная инфраструктура, AWS, IT аутсорсинг, цифровая трансформация',
  authors: [{ name: 'Тех Смысл' }],
  openGraph: {
    type: 'website',
    siteName: 'Тех Смысл',
    locale: 'ru_RU',
    title: 'Тех Смысл — разработка сайтов, мобильных приложений и AI-решений',
    description: 'IT компания полного цикла: веб-разработка, мобильные приложения, 3D-визуализация, AR и AI-решения.',
    url: 'https://techsmysl.ru/',
    images: ['/og-image.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Тех Смысл — разработка сайтов, мобильных приложений и AI-решений',
    description: 'IT компания полного цикла: веб-разработка, мобильные приложения, 3D-визуализация, AR и AI-решения.',
    images: ['/og-image.png'],
  },
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies()
  const cookieLocale = cookieStore.get('NEXT_LOCALE')?.value
  const lang = isValidLocale(cookieLocale ?? '') ? cookieLocale : 'ru'

  return (
    <html lang={lang} data-scroll-behavior="smooth" className={`${unbounded.variable} ${jetbrainsMono.variable} antialiased`}>
      <body className="min-h-screen flex flex-col">
        {children}
      </body>
    </html>
  )
}
