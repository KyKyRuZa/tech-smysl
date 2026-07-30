import type { Metadata } from 'next'
import { defaultMetadata } from '@/app/seo'

export const metadata: Metadata = defaultMetadata

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" className="antialiased">
      <body className="min-h-screen">
        {children}
      </body>
    </html>
  );
}
