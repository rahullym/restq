'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Suspense } from 'react'

function AuthErrorContent() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')

  const getErrorMessage = () => {
    switch (error) {
      case 'Configuration':
        return {
          title: 'Configuration Error',
          message: 'NextAuth is not properly configured. Please check your environment variables.',
          details: [
            'Ensure NEXTAUTH_SECRET is set (at least 32 characters)',
            'Ensure NEXTAUTH_URL matches your application URL',
            'For localhost, use: http://localhost:3002',
          ],
        }
      case 'AccessDenied':
        return {
          title: 'Access Denied',
          message: 'You do not have permission to access this resource.',
          details: ['Please contact your administrator if you believe this is an error.'],
        }
      case 'Verification':
        return {
          title: 'Verification Error',
          message: 'The verification token is invalid or has expired.',
          details: ['Please try logging in again.'],
        }
      case 'CredentialsSignin':
        return {
          title: 'Invalid Credentials',
          message: 'The email or password you entered is incorrect.',
          details: ['Please check your credentials and try again.'],
        }
      default:
        return {
          title: 'Authentication Error',
          message: 'An error occurred during authentication.',
          details: [
            'Please check your environment variables',
            'Ensure NEXTAUTH_SECRET is set',
            'Ensure NEXTAUTH_URL matches your application URL',
            'Check server logs for more details',
          ],
        }
    }
  }

  const errorInfo = getErrorMessage()

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-6">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
            <svg
              className="h-6 w-6 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{errorInfo.title}</h1>
          <p className="text-gray-600 mb-6">{errorInfo.message}</p>
        </div>

        {errorInfo.details && errorInfo.details.length > 0 && (
          <div className="mb-6">
            <h2 className="text-sm font-semibold text-gray-700 mb-2">Troubleshooting:</h2>
            <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
              {errorInfo.details.map((detail, index) => (
                <li key={index}>{detail}</li>
              ))}
            </ul>
          </div>
        )}

        {error && (
          <div className="mb-6 p-3 bg-gray-100 rounded-md">
            <p className="text-xs text-gray-500 mb-1">Error Code:</p>
            <p className="text-sm font-mono text-gray-700">{error}</p>
          </div>
        )}

        <div className="flex flex-col gap-3">
          <Link
            href="/admin/login"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            Try Again
          </Link>
          <Link
            href="/"
            className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            Go Home
          </Link>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            If this problem persists, check your environment variables:
            <br />
            <code className="mt-1 block text-xs bg-gray-100 p-2 rounded">
              NEXTAUTH_SECRET, NEXTAUTH_URL
            </code>
          </p>
        </div>
      </div>
    </div>
  )
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <AuthErrorContent />
    </Suspense>
  )
}



