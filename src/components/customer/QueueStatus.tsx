'use client'

import { useState, useEffect } from 'react'

interface QueueStatusProps {
  entryId: string
  restaurantSlug: string
  initialData: {
    tokenNumber: string
    position: number
    estimatedWaitMinutes: number
    status: string
    message: string
  }
}

export default function QueueStatus({
  entryId,
  restaurantSlug,
  initialData,
}: QueueStatusProps) {
  const [status, setStatus] = useState(initialData)
  const [loading, setLoading] = useState(false)

  const refreshStatus = async () => {
    setLoading(true)
    try {
      const response = await fetch(
        `/api/public/${restaurantSlug}/queue-status?entryId=${entryId}`
      )
      const result = await response.json()
      if (result.success) {
        setStatus(result.data)
      }
    } catch (error) {
      console.error('Error refreshing status:', error)
    } finally {
      setLoading(false)
    }
  }

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(refreshStatus, 30000)
    return () => clearInterval(interval)
  }, [entryId, restaurantSlug])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SEATED':
        return 'bg-green-100 text-green-800'
      case 'CALLED':
        return 'bg-yellow-100 text-yellow-800'
      case 'WAITING':
        return 'bg-blue-100 text-blue-800'
      case 'NO_SHOW':
      case 'CANCELLED':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 border border-primary-100">
      {/* Token Number - Mobile Optimized */}
      <div className="text-center mb-5 sm:mb-6">
        <div className="inline-block p-3 sm:p-4 bg-primary-50 rounded-2xl mb-3">
          <div className="text-4xl sm:text-5xl md:text-6xl font-bold text-primary-600 leading-none">
            {status.tokenNumber}
          </div>
        </div>
        <div className={`inline-block px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-semibold ${getStatusColor(status.status)}`}>
          {status.status === 'WAITING' && '⏳ Waiting'}
          {status.status === 'CALLED' && '🔔 Your Turn!'}
          {status.status === 'SEATED' && '✅ Seated'}
          {(status.status === 'NO_SHOW' || status.status === 'CANCELLED') && '❌ Cancelled'}
        </div>
      </div>

      <div className="space-y-4 sm:space-y-5">
        {/* Status Message - Mobile Optimized */}
        <div className="text-center px-2">
          <p className="text-base sm:text-lg font-medium text-gray-800 leading-relaxed">{status.message}</p>
        </div>

        {/* Waiting Status Card - Mobile Optimized */}
        {status.status === 'WAITING' && (
          <div className="bg-gradient-to-br from-primary-50 to-blue-50 rounded-xl sm:rounded-2xl p-5 sm:p-6 border-2 border-primary-200">
            <div className="text-center">
              <div className="text-[10px] sm:text-xs uppercase tracking-wider text-gray-600 mb-2 sm:mb-3">Your Position</div>
              <div className="text-4xl sm:text-5xl md:text-6xl font-bold text-primary-600 mb-2 leading-none">
                {status.position}
                <span className="text-xl sm:text-2xl md:text-3xl text-primary-500">
                  {status.position === 1
                    ? 'st'
                    : status.position === 2
                    ? 'nd'
                    : status.position === 3
                    ? 'rd'
                    : 'th'}
                </span>
              </div>
              <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-primary-200">
                <div className="text-xs sm:text-sm text-gray-600 mb-1">Estimated wait time</div>
                <div className="text-xl sm:text-2xl font-bold text-gray-800">
                  ~{status.estimatedWaitMinutes} min
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Called Status Card - Mobile Optimized */}
        {status.status === 'CALLED' && (
          <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl sm:rounded-2xl p-5 sm:p-6 border-2 border-yellow-300 animate-pulse">
            <div className="text-center">
              <div className="text-3xl sm:text-4xl mb-2 sm:mb-3">🔔</div>
              <div className="text-lg sm:text-xl font-bold text-gray-800 mb-1.5 sm:mb-2 leading-tight">Your table is ready!</div>
              <div className="text-xs sm:text-sm text-gray-600 leading-relaxed">Please proceed to the entrance</div>
            </div>
          </div>
        )}

        {/* Seated Status Card - Mobile Optimized */}
        {status.status === 'SEATED' && (
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl sm:rounded-2xl p-5 sm:p-6 border-2 border-green-300">
            <div className="text-center">
              <div className="text-3xl sm:text-4xl mb-2 sm:mb-3">✅</div>
              <div className="text-lg sm:text-xl font-bold text-gray-800 leading-tight">Enjoy your meal!</div>
            </div>
          </div>
        )}

        {/* Auto-refresh indicator */}
        <div className="text-center">
          <p className="text-xs text-gray-400">Status updates automatically every 30 seconds</p>
        </div>

        {/* Refresh Button - Mobile Optimized with larger touch target */}
        <button
          onClick={refreshStatus}
          disabled={loading}
          className="w-full py-4 sm:py-3.5 px-6 border-2 border-gray-200 rounded-xl shadow-sm text-sm sm:text-base font-semibold text-gray-700 bg-white hover:bg-gray-50 active:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:opacity-50 transition-all min-h-[48px] touch-manipulation"
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Refreshing...
            </span>
          ) : (
            <span className="flex items-center justify-center">
              <svg className="mr-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh Status
            </span>
          )}
        </button>
      </div>
    </div>
  )
}





