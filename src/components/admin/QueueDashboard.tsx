'use client'

import { QueueEntryResponse } from '@/types'
import QueueTable from './QueueTable'
import CallNextButton from './CallNextButton'

interface QueueDashboardProps {
  entries: QueueEntryResponse[]
  restaurantId: string
}

export default function QueueDashboard({ entries, restaurantId }: QueueDashboardProps) {
  const waitingCount = entries.filter((e) => e.status === 'WAITING').length
  const calledCount = entries.filter((e) => e.status === 'CALLED').length
  const seatedCount = entries.filter((e) => e.status === 'SEATED').length

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-500">Waiting</div>
          <div className="mt-2 text-3xl font-bold text-blue-600">{waitingCount}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-500">Called</div>
          <div className="mt-2 text-3xl font-bold text-yellow-600">{calledCount}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-500">Seated</div>
          <div className="mt-2 text-3xl font-bold text-green-600">{seatedCount}</div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h2 className="text-lg font-semibold text-gray-900">Queue</h2>
            <CallNextButton restaurantId={restaurantId} />
          </div>
        </div>
        <div className="p-6">
          <QueueTable entries={entries} restaurantId={restaurantId} />
        </div>
      </div>
    </div>
  )
}


