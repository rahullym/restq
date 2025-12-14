'use client'

import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Application error:', error)
  }, [error])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Something went wrong!</h1>
        <p className="text-gray-600 mb-6">
          {error.message || 'An unexpected error occurred'}
        </p>
        {error.message?.includes('database') || error.message?.includes('Prisma') ? (
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-6 text-left">
            <p className="text-sm text-yellow-800">
              <strong>Database Connection Issue:</strong> Make sure your database is set up and the DATABASE_URL in your .env file is correct.
            </p>
          </div>
        ) : null}
        <button
          onClick={reset}
          className="px-6 py-3 bg-primary-600 text-white font-medium rounded-md hover:bg-primary-700"
        >
          Try again
        </button>
      </div>
    </div>
  )
}


