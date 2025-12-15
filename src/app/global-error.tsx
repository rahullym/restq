'use client'

/**
 * Global Error Boundary for Next.js
 * 
 * This file handles errors that occur in the root layout.
 * 
 * CRITICAL: This component renders outside the normal React tree.
 * - NO React hooks (useEffect, useState, useContext, etc.)
 * - NO imports from components that use React context
 * - NO CSS classes or Tailwind (use inline styles only)
 * - Must render its own <html> and <body> tags
 * 
 * During build, Next.js may try to prerender this page.
 * Any attempt to access React context will fail with "Cannot read properties of null (reading 'useContext')"
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  // Extract values before render to avoid any potential issues
  const errorMessage = error?.message || 'An unexpected error occurred'
  const errorDigest = error?.digest || null

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Error - RESq</title>
      </head>
      <body style={{ 
        margin: 0, 
        padding: 0, 
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        backgroundColor: '#f9fafb'
      }}>
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem'
        }}>
          <div style={{ 
            textAlign: 'center', 
            maxWidth: '28rem', 
            width: '100%' 
          }}>
            <h1 style={{
              fontSize: '2.25rem',
              fontWeight: 'bold',
              color: '#111827',
              marginBottom: '1rem',
              marginTop: 0,
              lineHeight: '1.2'
            }}>
              Something went wrong!
            </h1>
            <p style={{
              color: '#4b5563',
              marginBottom: '1.5rem',
              fontSize: '1rem',
              lineHeight: '1.5'
            }}>
              {errorMessage}
            </p>
            
            {errorDigest && (
              <div style={{
                backgroundColor: '#f3f4f6',
                border: '1px solid #e5e7eb',
                borderRadius: '0.375rem',
                padding: '0.75rem',
                marginBottom: '1rem',
                textAlign: 'left'
              }}>
                <p style={{
                  fontSize: '0.75rem',
                  color: '#4b5563',
                  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                  margin: 0,
                  wordBreak: 'break-word'
                }}>
                  <strong>Error ID:</strong> {errorDigest}
                </p>
              </div>
            )}
            
            <div style={{ 
              display: 'flex', 
              gap: '0.75rem', 
              justifyContent: 'center', 
              flexWrap: 'wrap' 
            }}>
              <button
                type="button"
                onClick={reset}
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: '#2563eb',
                  color: 'white',
                  fontWeight: '500',
                  borderRadius: '0.375rem',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '1rem'
                }}
              >
                Try again
              </button>
              <button
                type="button"
                onClick={() => {
                  if (typeof window !== 'undefined') {
                    window.location.href = '/'
                  }
                }}
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: '#e5e7eb',
                  color: '#374151',
                  fontWeight: '500',
                  borderRadius: '0.375rem',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '1rem'
                }}
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
