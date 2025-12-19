'use client'

import MobileMenuButton from './MobileMenuButton'

export default function AdminHeader() {
  return (
    <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-30">
      <div className="px-4 py-3 sm:px-4 sm:py-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            {/* Mobile Menu Button - Integrated in Header */}
            <MobileMenuButton />
            <h2 className="text-lg sm:text-lg font-bold text-gray-900">Dashboard</h2>
          </div>
          {/* Quick Stats - Hidden on Mobile for Simplicity */}
          <div className="hidden sm:flex items-center gap-2">
            <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 rounded-lg">
              <span className="text-lg">⏱️</span>
              <div>
                <p className="text-xs text-gray-600">Avg Wait</p>
                <p className="text-sm font-bold text-blue-700">15 min</p>
              </div>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 bg-green-50 rounded-lg">
              <span className="text-lg">👥</span>
              <div>
                <p className="text-xs text-gray-600">In Queue</p>
                <p className="text-sm font-bold text-green-700">12</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
