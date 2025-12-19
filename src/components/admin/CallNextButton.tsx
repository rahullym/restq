'use client'

import { useState } from 'react'

interface CallNextButtonProps {
  restaurantId: string
  onCallNext: () => void
  isLoading?: boolean
}

export default function CallNextButton({
  restaurantId,
  onCallNext,
  isLoading = false,
}: CallNextButtonProps) {
  const [ripples, setRipples] = useState<Array<{ x: number; y: number; id: number }>>([])

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!isLoading) {
      const rect = e.currentTarget.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      const newRipple = { x, y, id: Date.now() }
      
      setRipples([...ripples, newRipple])
      setTimeout(() => {
        setRipples(ripples => ripples.filter(r => r.id !== newRipple.id))
      }, 600)
      
      onCallNext()
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={isLoading}
      className="w-full sm:w-auto px-5 py-3 sm:px-4 sm:py-2 bg-indigo-600 text-white font-bold text-base sm:text-sm rounded-xl shadow-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95"
    >
      <span className="flex items-center justify-center gap-1.5">
        {isLoading ? (
          <>
            <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>Calling...</span>
          </>
        ) : (
          <span>Call Next</span>
        )}
      </span>
    </button>
  )
}





