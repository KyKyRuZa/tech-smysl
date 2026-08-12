import type { Metadata } from 'next'
import { Unbounded, JetBrains_Mono } from 'next/font/google'
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" className={`${unbounded.variable} ${jetbrainsMono.variable} antialiased`}>
      <body className="min-h-screen flex flex-col">
        {children}
      </body>
    </html>
  )
}
