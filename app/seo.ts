import { Metadata } from 'next'

export const defaultMetadata: Metadata = {
  title: 'Tech Smysl',
  description: 'Technical meaning platform',
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3001'),
  robots: {
    index: true,
    follow: true,
  },
}
