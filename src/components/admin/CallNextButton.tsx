'use client'

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
  return (
    <button
      onClick={onCallNext}
      disabled={isLoading}
      className="w-full sm:w-auto px-6 py-3 bg-primary-600 text-white font-semibold rounded-lg shadow-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
    >
      {isLoading ? 'Calling...' : 'Call Next Customer'}
    </button>
  )
}


