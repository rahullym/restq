'use client'

import { AnalyticsData } from '@/types'
import { useState, useEffect } from 'react'

interface AnalyticsDashboardProps {
  analytics: AnalyticsData
}

export default function AnalyticsDashboard({ analytics }: AnalyticsDashboardProps) {
  const [animatedValues, setAnimatedValues] = useState({
    customersServed: 0,
    avgWaitTime: 0,
    noShowRate: 0,
    totalEntries: 0,
  })

  // Animate numbers on mount
  useEffect(() => {
    const duration = 1000 // 1 second
    const steps = 60
    const interval = duration / steps

    let currentStep = 0
    const timer = setInterval(() => {
      currentStep++
      const progress = currentStep / steps

      setAnimatedValues({
        customersServed: Math.floor(analytics.customersServedToday * progress),
        avgWaitTime: Math.floor(analytics.averageWaitTime * progress),
        noShowRate: Math.floor(analytics.noShowRate * progress),
        totalEntries: Math.floor(analytics.totalQueueEntries * progress),
      })

      if (currentStep >= steps) {
        clearInterval(timer)
        setAnimatedValues({
          customersServed: analytics.customersServedToday,
          avgWaitTime: analytics.averageWaitTime,
          noShowRate: analytics.noShowRate,
          totalEntries: analytics.totalQueueEntries,
        })
      }
    }, interval)

    return () => clearInterval(timer)
  }, [analytics])

  const getNoShowRateColor = (rate: number) => {
    if (rate < 10) return 'from-green-500 to-green-600'
    if (rate < 20) return 'from-yellow-500 to-yellow-600'
    return 'from-red-500 to-red-600'
  }

  const getWaitTimeColor = (time: number) => {
    if (time < 15) return 'from-green-500 to-green-600'
    if (time < 30) return 'from-yellow-500 to-yellow-600'
    return 'from-red-500 to-red-600'
  }

  const MetricCard = ({ title, value, suffix, icon, gradient, subtext, progress }: any) => (
    <div className={`relative bg-gradient-to-br ${gradient} rounded-2xl shadow-xl p-6 transform transition-all duration-300 hover:scale-105 hover:shadow-2xl cursor-pointer overflow-hidden group`}>
      {/* Animated background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-gradient-to-br from-white to-transparent animate-pulse"></div>
      </div>
      
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="text-sm font-semibold text-white/80 uppercase tracking-wide mb-2">
              {title}
            </div>
            <div className="text-4xl font-bold text-white mb-1 transition-all duration-300 group-hover:scale-110">
              {value}{suffix}
            </div>
            {subtext && (
              <div className="text-xs text-white/70 mt-2">
                {subtext}
              </div>
            )}
          </div>
          <div className="text-5xl opacity-30 group-hover:opacity-50 transition-opacity">
            {icon}
          </div>
        </div>

        {/* Progress bar */}
        {progress !== undefined && (
          <div className="mt-4 bg-white/20 rounded-full h-2 overflow-hidden">
            <div 
              className="bg-white h-full rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        )}

        {/* Hover effect indicator */}
        <div className="absolute bottom-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-2xl transform translate-x-12 translate-y-12 group-hover:translate-x-8 group-hover:translate-y-8 transition-transform duration-500"></div>
      </div>
    </div>
  )

  const efficiency = analytics.customersServedToday > 0 
    ? Math.min(100, Math.round((analytics.customersServedToday / (analytics.totalQueueEntries || 1)) * 100))
    : 0

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Customers Served"
          value={animatedValues.customersServed}
          suffix=""
          icon="👥"
          gradient="from-blue-500 to-blue-700"
          subtext="Today's total"
          progress={efficiency}
        />

        <MetricCard
          title="Avg Wait Time"
          value={animatedValues.avgWaitTime}
          suffix=" min"
          icon="⏱️"
          gradient={getWaitTimeColor(analytics.averageWaitTime)}
          subtext={analytics.averageWaitTime < 20 ? "Excellent!" : analytics.averageWaitTime < 30 ? "Good" : "Needs improvement"}
        />

        <MetricCard
          title="No-Show Rate"
          value={animatedValues.noShowRate}
          suffix="%"
          icon="❌"
          gradient={getNoShowRateColor(analytics.noShowRate)}
          subtext={analytics.noShowRate < 10 ? "Great!" : analytics.noShowRate < 20 ? "Fair" : "High"}
          progress={100 - analytics.noShowRate}
        />

        <MetricCard
          title="Queue Entries"
          value={animatedValues.totalEntries}
          suffix=""
          icon="📊"
          gradient="from-purple-500 to-purple-700"
          subtext={`${analytics.activeQueueCount} currently active`}
        />
      </div>

      {/* Additional Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-gray-500 mb-1">Service Efficiency</div>
              <div className="text-2xl font-bold text-gray-900">{efficiency}%</div>
              <div className="text-xs text-gray-500 mt-1">Served vs Total</div>
            </div>
            <div className="text-4xl">📈</div>
          </div>
          <div className="mt-4 bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-green-400 to-green-600 h-2 rounded-full transition-all duration-1000"
              style={{ width: `${efficiency}%` }}
            ></div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-gray-500 mb-1">Peak Hours</div>
              <div className="text-2xl font-bold text-gray-900">6-8 PM</div>
              <div className="text-xs text-gray-500 mt-1">Busiest time</div>
            </div>
            <div className="text-4xl">🕐</div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-gray-500 mb-1">Customer Rating</div>
              <div className="text-2xl font-bold text-gray-900">4.8 ⭐</div>
              <div className="text-xs text-gray-500 mt-1">Based on wait time</div>
            </div>
            <div className="text-4xl">😊</div>
          </div>
        </div>
      </div>

      {/* Quick Stats Banner */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-xl shadow-xl p-6 text-white">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
              <span className="text-2xl">🎯</span>
            </div>
            <div>
              <div className="text-sm opacity-90">Today's Performance</div>
              <div className="text-lg font-bold">
                {efficiency > 80 ? 'Excellent' : efficiency > 60 ? 'Good' : 'Needs Improvement'}
              </div>
            </div>
          </div>
          
          <div className="flex gap-8">
            <div className="text-center">
              <div className="text-2xl font-bold">{analytics.activeQueueCount}</div>
              <div className="text-xs opacity-80">Active Now</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{analytics.customersServedToday}</div>
              <div className="text-xs opacity-80">Served</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">~{analytics.averageWaitTime}m</div>
              <div className="text-xs opacity-80">Avg Wait</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}





