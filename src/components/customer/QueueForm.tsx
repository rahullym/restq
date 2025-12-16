'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { z } from 'zod'

const queueFormSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  mobileNumber: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid mobile number'),
  partySize: z.number().int().min(1).max(20).optional().default(2),
  seatingType: z.enum(['Indoor', 'Outdoor', 'Any']).optional(),
})

interface QueueFormProps {
  restaurantSlug: string
  currentQueueCount: number
  estimatedWaitTime: string
}

export default function QueueForm({
  restaurantSlug,
  currentQueueCount,
  estimatedWaitTime,
}: QueueFormProps) {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: '',
    mobileNumber: '',
    partySize: 2,
    seatingType: 'Any' as 'Indoor' | 'Outdoor' | 'Any',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})
    setLoading(true)

    try {
      // Validate form data
      const validatedData = queueFormSchema.parse(formData)

      // Submit to API
      const response = await fetch(`/api/public/${restaurantSlug}/queue`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(validatedData),
      })

      const result = await response.json()

      if (!result.success) {
        setErrors({ submit: result.error || 'Failed to join queue' })
        setLoading(false)
        return
      }

      // Redirect to success page with entry ID
      router.push(`/${restaurantSlug}/success?entryId=${result.data.id}`)
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {}
        error.errors.forEach((err) => {
          if (err.path[0]) {
            fieldErrors[err.path[0].toString()] = err.message
          }
        })
        setErrors(fieldErrors)
      } else {
        setErrors({ submit: 'An error occurred. Please try again.' })
      }
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 border border-primary-100">
      <form onSubmit={handleSubmit} className="space-y-5">
        {errors.submit && (
          <div className="rounded-xl bg-red-50 border border-red-200 p-4">
            <div className="text-sm text-red-800 font-medium">{errors.submit}</div>
          </div>
        )}

        <div>
          <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
            Your Name
          </label>
          <input
            id="name"
            type="text"
            required
            placeholder="John Doe"
            className="w-full px-4 py-3.5 text-base border-2 border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
          {errors.name && <p className="mt-2 text-sm text-red-600">{errors.name}</p>}
        </div>

        <div>
          <label htmlFor="mobileNumber" className="block text-sm font-semibold text-gray-700 mb-2">
            Phone Number
          </label>
          <input
            id="mobileNumber"
            type="tel"
            required
            placeholder="+1 234 567 8900"
            inputMode="tel"
            className="w-full px-4 py-3.5 text-base border-2 border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
            value={formData.mobileNumber}
            onChange={(e) => setFormData({ ...formData, mobileNumber: e.target.value })}
          />
          {errors.mobileNumber && (
            <p className="mt-2 text-sm text-red-600">{errors.mobileNumber}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="partySize" className="block text-sm font-semibold text-gray-700 mb-2">
              Party Size
            </label>
            <input
              id="partySize"
              type="number"
              min="1"
              max="20"
              className="w-full px-4 py-3.5 text-base border-2 border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
              value={formData.partySize}
              onChange={(e) =>
                setFormData({ ...formData, partySize: parseInt(e.target.value) || 2 })
              }
            />
          </div>

          <div>
            <label htmlFor="seatingType" className="block text-sm font-semibold text-gray-700 mb-2">
              Seating
            </label>
            <select
              id="seatingType"
              className="w-full px-4 py-3.5 text-base border-2 border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all bg-white"
              value={formData.seatingType}
              onChange={(e) =>
                setFormData({ ...formData, seatingType: e.target.value as any })
              }
            >
              <option value="Any">Any</option>
              <option value="Indoor">Indoor</option>
              <option value="Outdoor">Outdoor</option>
            </select>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full mt-6 flex justify-center items-center py-4 px-6 border border-transparent rounded-xl shadow-lg text-base font-semibold text-white bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 focus:outline-none focus:ring-4 focus:ring-primary-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform active:scale-[0.98]"
        >
          {loading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Joining Queue...
            </>
          ) : (
            <>
              Join Queue
              <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </>
          )}
        </button>
      </form>
    </div>
  )
}



