'use client'

import { useEffect } from 'react'

/**
 * Global Error Boundary
 * This component must NOT use any React context providers
 * as it renders outside the normal component tree
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log error details for debugging
    console.error('Global application error:', {
      message: error.message,
      digest: error.digest,
      name: error.name,
    })
  }, [error])

  return (
    <html lang="en">
      <body>
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
              </div>
            )}
            
            <div className="flex gap-3 justify-center">
              <button
                onClick={reset}
                className="px-6 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors"
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
      </body>
    </html>
  )
}
