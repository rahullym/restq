'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface CallNextButtonProps {
  restaurantId: string
}

export default function CallNextButton({ restaurantId }: CallNextButtonProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleCallNext = async () => {
    setLoading(true)
    setError('')

    try {
      const response = await fetch(`/api/admin/${restaurantId}/queue/call-next`, {
        method: 'POST',
      })

      const result = await response.json()

      if (!result.success) {
        setError(result.error || 'Failed to call next customer')
        setLoading(false)
        return
      }

      // Refresh the page to show updated queue
      router.refresh()
    } catch (err) {
      setError('An error occurred. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div>
      {error && (
        <div className="mb-4 rounded-md bg-red-50 p-4">
          <div className="text-sm text-red-800">{error}</div>
        </div>
      )}
      <button
        onClick={handleCallNext}
        disabled={loading}
        className="w-full sm:w-auto px-6 py-3 bg-primary-600 text-white font-semibold rounded-lg shadow-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Calling...' : 'Call Next Customer'}
      </button>
    </div>
  )
}


