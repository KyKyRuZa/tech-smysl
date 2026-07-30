'use client'

export default function GlobalError({
  reset,
}: {
  reset: () => void
}) {
  return (
    <html>
      <body>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-6xl font-bold mb-4">500</h1>
            <p className="text-gray-600 mb-8">Something went wrong</p>
            <button
              onClick={reset}
              className="px-6 py-3 bg-black text-white rounded hover:bg-gray-800"
            >
              Try again
            </button>
          </div>
        </div>
      </body>
    </html>
  )
}
