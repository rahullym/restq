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
    // Log error details for debugging (visible in browser console and server logs)
    console.error('Application error:', {
      message: error.message,
      digest: error.digest,
      name: error.name,
      stack: error.stack,
    })
    
    // In production, you might want to send this to an error tracking service
    // Example: Sentry.captureException(error)
  }, [error])

  const isDatabaseError = 
    error.message?.toLowerCase().includes('database') ||
    error.message?.toLowerCase().includes('prisma') ||
    error.message?.toLowerCase().includes('connect') ||
    error.message?.toLowerCase().includes('connection') ||
    error.cause?.toString().includes('Prisma') ||
    error.cause?.toString().includes('database')

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Something went wrong!</h1>
        <p className="text-gray-600 mb-6">
          {error.message || 'An unexpected error occurred'}
        </p>
        
        {error.digest && (
          <div className="bg-gray-100 border border-gray-200 rounded-md p-3 mb-4 text-left">
            <p className="text-xs text-gray-600 font-mono">
              <strong>Error ID:</strong> {error.digest}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Include this ID when reporting the issue
            </p>
          </div>
        )}
        
        {isDatabaseError && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-6 text-left">
            <p className="text-sm text-yellow-800 mb-2">
              <strong>Database Connection Issue</strong>
            </p>
            <ul className="text-xs text-yellow-700 list-disc list-inside space-y-1">
              <li>Check that DATABASE_URL is set correctly in your environment variables</li>
              <li>Verify your database is running and accessible</li>
              <li>Ensure your database connection string uses the correct port (5432 for direct connection)</li>
              <li>Check Render logs for detailed error information</li>
            </ul>
          </div>
        )}
        
        <div className="flex gap-3 justify-center">
          <button
            onClick={reset}
            className="px-6 py-3 bg-primary-600 text-white font-medium rounded-md hover:bg-primary-700 transition-colors"
          >
            Try again
          </button>
          <button
            onClick={() => window.location.href = '/'}
            className="px-6 py-3 bg-gray-200 text-gray-700 font-medium rounded-md hover:bg-gray-300 transition-colors"
          >
            Go home
          </button>
        </div>
      </div>
    </div>
  )
}


