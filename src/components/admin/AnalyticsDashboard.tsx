import { AnalyticsData } from '@/types'

interface AnalyticsDashboardProps {
  analytics: AnalyticsData
}

export default function AnalyticsDashboard({ analytics }: AnalyticsDashboardProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-sm font-medium text-gray-500">Customers Served Today</div>
        <div className="mt-2 text-3xl font-bold text-gray-900">
          {analytics.customersServedToday}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-sm font-medium text-gray-500">Average Wait Time</div>
        <div className="mt-2 text-3xl font-bold text-gray-900">
          ~{analytics.averageWaitTime} min
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-sm font-medium text-gray-500">No-Show Rate</div>
        <div className="mt-2 text-3xl font-bold text-gray-900">{analytics.noShowRate}%</div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-sm font-medium text-gray-500">Total Queue Entries</div>
        <div className="mt-2 text-3xl font-bold text-gray-900">{analytics.totalQueueEntries}</div>
        <div className="mt-1 text-sm text-gray-500">
          {analytics.activeQueueCount} active in queue
        </div>
      </div>
    </div>
  )
}



