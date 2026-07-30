import Link from 'next/link'
import type { Metadata } from 'next'
import { defaultMetadata } from '@/app/seo'

export const metadata: Metadata = {
  ...defaultMetadata,
  title: '404 - Not Found',
}

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold mb-4">404</h1>
        <p className="text-gray-600 mb-8">Page not found</p>
        <Link
          href="/"
          className="inline-block px-6 py-3 bg-black text-white rounded hover:bg-gray-800"
        >
          Go home
        </Link>
      </div>
    </div>
  )
}
