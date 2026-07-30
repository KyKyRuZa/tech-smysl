import { verifySession } from '@/lib/auth/session'

export default async function AdminPage() {
  const session = await verifySession()

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Admin Panel</h1>
          <form action="/api/auth/logout" method="POST">
            <button
              type="submit"
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Logout
            </button>
          </form>
        </div>
      <p className="text-gray-600">Welcome, user {session.userId}</p>
      <p className="text-sm text-gray-500">Role: {session.role}</p>
      </div>
    </div>
  )
}
