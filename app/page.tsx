import { cookies } from 'next/headers'
import { decrypt } from '@/lib/auth/session'
import { redirect } from 'next/navigation'

export default async function Home() {
  const cookieStore = await cookies()
  const session = cookieStore.get('session')?.value
  const payload = await decrypt(session)

  if (payload?.userId) {
    redirect('/admin')
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Tech Smysl</h1>
        <p className="text-gray-600 mb-8">Technical meaning platform</p>
        <a
          href="/login"
          className="inline-block px-6 py-3 bg-black text-white rounded hover:bg-gray-800"
        >
          Admin Login
        </a>
      </div>
    </div>
  )
}
