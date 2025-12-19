'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { useSidebar } from '@/contexts/SidebarContext'
import { RestaurantRole } from '@prisma/client'
import { useSession } from 'next-auth/react'

interface NavLinkProps {
  href: string
  icon: string
  children: React.ReactNode
  badge?: number
  isCollapsed?: boolean
}

function NavLink({ href, icon, children, badge, isCollapsed }: NavLinkProps) {
  const pathname = usePathname()
  const isActive = pathname === href
  const { isMobile, setIsOpen } = useSidebar()

  return (
    <Link
      href={href}
      className={`
        flex items-center gap-3 px-4 py-4 rounded-xl font-semibold transition-all duration-200 group relative
        ${isMobile ? 'text-base' : ''}
        ${
          isActive
            ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
            : 'text-gray-700 hover:bg-gray-100'
        }
        ${isCollapsed ? 'justify-center' : ''}
        active:scale-95
      `}
      title={isCollapsed ? children as string : undefined}
      onClick={() => {
        // Close mobile menu when link is clicked
        if (isMobile) {
          setIsOpen(false)
        }
      }}
    >
      <span className={`text-2xl ${isMobile ? 'text-3xl' : ''}`}>
        {icon}
      </span>
      {!isCollapsed && (
        <>
          <span className="flex-1">{children}</span>
          {badge !== undefined && badge > 0 && (
            <span className="flex items-center justify-center w-6 h-6 text-xs font-bold bg-red-500 text-white rounded-full">
              {badge}
            </span>
          )}
        </>
      )}
    </Link>
  )
}

interface RestaurantMapping {
  restaurantId: string
  role: RestaurantRole
  restaurantName: string
  restaurantSlug: string
}

interface AdminNavProps {
  userEmail: string
  restaurantMappings?: RestaurantMapping[]
  selectedRestaurantId?: string
}

export default function AdminNav({
  userEmail,
  restaurantMappings = [],
  selectedRestaurantId,
}: AdminNavProps) {
  const { isCollapsed, setIsCollapsed, isMobile, isOpen, setIsOpen } = useSidebar()
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showRestaurantSwitcher, setShowRestaurantSwitcher] = useState(false)
  const router = useRouter()
  const { update } = useSession()

  const getInitials = (email: string) => {
    return email.charAt(0).toUpperCase()
  }

  const getRoleBadgeColor = (role: RestaurantRole) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return 'bg-purple-100 text-purple-800'
      case 'RESTAURANT_ADMIN':
        return 'bg-blue-100 text-blue-800'
      case 'STAFF':
        return 'bg-green-100 text-green-800'
      case 'VIEW_ONLY':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const handleRestaurantSwitch = async (restaurantId: string) => {
    try {
      const response = await fetch('/api/auth/select-restaurant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ restaurantId }),
      })

      const data = await response.json()

      if (data.success) {
        // Update session with selected restaurant
        await update({ selectedRestaurantId: restaurantId })
        setShowRestaurantSwitcher(false)
        router.refresh()
        router.push('/admin/dashboard')
      }
    } catch (error) {
      console.error('Error switching restaurant:', error)
    }
  }

  const selectedRestaurant = selectedRestaurantId
    ? restaurantMappings.find((m) => m.restaurantId === selectedRestaurantId)
    : null

  return (
    <>
      <aside
        className={`
          fixed left-0 top-0 h-screen bg-white border-r border-gray-200 shadow-xl z-50
          transition-all duration-300 ease-in-out
          ${isMobile
            ? isOpen
              ? 'translate-x-0'
              : '-translate-x-full'
            : isCollapsed
            ? 'w-20'
            : 'w-72'}
        `}
      >
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          {!isCollapsed && (
            <Link
              href="/admin/dashboard"
              className="flex items-center gap-3 group"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg transform transition-transform group-hover:scale-110">
                <span className="text-white font-bold text-xl">R</span>
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  RESq
                </h1>
                <p className="text-xs text-gray-500">Admin Portal</p>
              </div>
            </Link>
          )}
          {!isMobile && (
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              <span className="text-xl">{isCollapsed ? '→' : '←'}</span>
            </button>
          )}
          {isMobile && (
            <button
              onClick={() => setIsOpen(false)}
              className="p-3 rounded-xl hover:bg-gray-100 transition-colors active:scale-95"
              title="Close menu"
            >
              <span className="text-3xl font-bold">×</span>
            </button>
          )}
        </div>

        {/* Restaurant Switcher */}
        {restaurantMappings.length > 1 && (
          <div className="px-4 pt-4 pb-2 border-b border-gray-200">
            <div className="relative">
              <button
                onClick={() => setShowRestaurantSwitcher(!showRestaurantSwitcher)}
                className={`
                  w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-100 transition-all duration-300
                  ${isCollapsed ? 'justify-center' : ''}
                `}
                title={isCollapsed && selectedRestaurant ? selectedRestaurant.restaurantName : undefined}
              >
                <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                  {selectedRestaurant ? selectedRestaurant.restaurantName.charAt(0) : '?'}
                </div>
                {!isCollapsed && selectedRestaurant && (
                  <div className="flex-1 text-left">
                    <p className="text-sm font-semibold text-gray-900 truncate">
                      {selectedRestaurant.restaurantName}
                    </p>
                    <p
                      className={`text-xs px-2 py-0.5 rounded-full inline-block ${getRoleBadgeColor(
                        selectedRestaurant.role
                      )}`}
                    >
                      {selectedRestaurant.role.replace('_', ' ')}
                    </p>
                  </div>
                )}
                {!isCollapsed && (
                  <span className={`text-gray-400 transition-transform ${showRestaurantSwitcher ? 'rotate-180' : ''}`}>
                    ▼
                  </span>
                )}
              </button>

              {/* Restaurant Dropdown */}
              {showRestaurantSwitcher && !isCollapsed && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden z-50 max-h-64 overflow-y-auto">
                  {restaurantMappings.map((mapping) => (
                    <button
                      key={mapping.restaurantId}
                      onClick={() => handleRestaurantSwitch(mapping.restaurantId)}
                      className={`
                        w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left
                        ${mapping.restaurantId === selectedRestaurantId ? 'bg-indigo-50' : ''}
                      `}
                    >
                      <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                        {mapping.restaurantName.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-900">{mapping.restaurantName}</p>
                        <p
                          className={`text-xs px-2 py-0.5 rounded-full inline-block mt-1 ${getRoleBadgeColor(
                            mapping.role
                          )}`}
                        >
                          {mapping.role.replace('_', ' ')}
                        </p>
                      </div>
                      {mapping.restaurantId === selectedRestaurantId && (
                        <span className="text-indigo-600">✓</span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Navigation Links */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <div className={`${isCollapsed ? 'text-center' : ''} mb-4`}>
            {!isCollapsed && (
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-4 mb-2">
                Main Menu
              </p>
            )}
          </div>
          
          <NavLink href="/admin/dashboard" icon="📊" isCollapsed={isCollapsed} badge={5}>
            Queue Dashboard
          </NavLink>
          
          <NavLink href="/admin/analytics" icon="📈" isCollapsed={isCollapsed}>
            Analytics
          </NavLink>
          
          <NavLink href="/admin/settings" icon="⚙️" isCollapsed={isCollapsed}>
            Settings
          </NavLink>
          
          {selectedRestaurant &&
            (selectedRestaurant.role === 'RESTAURANT_ADMIN' ||
              selectedRestaurant.role === 'SUPER_ADMIN') && (
              <NavLink href="/admin/users" icon="👥" isCollapsed={isCollapsed}>
                Users
              </NavLink>
            )}

          {!isCollapsed && (
            <div className="pt-6">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-4 mb-2">
                Quick Actions
              </p>
            </div>
          )}

          <button
            className={`
              w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-300 group
              text-gray-700 hover:bg-gradient-to-r hover:from-green-500 hover:to-emerald-600 hover:text-white hover:shadow-lg hover:scale-105
              ${isCollapsed ? 'justify-center' : ''}
            `}
            title={isCollapsed ? 'Add Customer' : undefined}
          >
            <span className="text-2xl transition-transform group-hover:scale-110">➕</span>
            {!isCollapsed && <span>Add Customer</span>}
          </button>

          <button
            className={`
              w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-300 group
              text-gray-700 hover:bg-gradient-to-r hover:from-blue-500 hover:to-cyan-600 hover:text-white hover:shadow-lg hover:scale-105
              ${isCollapsed ? 'justify-center' : ''}
            `}
            title={isCollapsed ? 'Export Data' : undefined}
          >
            <span className="text-2xl transition-transform group-hover:scale-110">📥</span>
            {!isCollapsed && <span>Export Data</span>}
          </button>
        </nav>

        {/* User Profile Section */}
        <div className="p-4 border-t border-gray-200">
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className={`
                w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-100 transition-all duration-300 group
                ${isCollapsed ? 'justify-center' : ''}
              `}
            >
              <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-orange-500 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                {getInitials(userEmail)}
              </div>
              {!isCollapsed && (
                <div className="flex-1 text-left">
                  <p className="text-sm font-semibold text-gray-900 truncate">{userEmail}</p>
                  <p className="text-xs text-gray-500">Administrator</p>
                </div>
              )}
              {!isCollapsed && (
                <span className={`text-gray-400 transition-transform ${showUserMenu ? 'rotate-180' : ''}`}>
                  ▼
                </span>
              )}
            </button>

            {/* User Dropdown Menu */}
            {showUserMenu && !isCollapsed && (
              <div className="absolute bottom-full left-0 right-0 mb-2 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden animate-slide-up">
                <Link
                  href="/admin/profile"
                  className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                >
                  <span className="text-xl">👤</span>
                  <span className="text-sm font-medium text-gray-700">Profile</span>
                </Link>
                <Link
                  href="/admin/settings"
                  className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                >
                  <span className="text-xl">⚙️</span>
                  <span className="text-sm font-medium text-gray-700">Settings</span>
                </Link>
                <div className="border-t border-gray-200"></div>
                <a
                  href="/api/auth/signout"
                  className="flex items-center gap-3 px-4 py-3 hover:bg-red-50 transition-colors text-red-600"
                >
                  <span className="text-xl">🚪</span>
                  <span className="text-sm font-medium">Logout</span>
                </a>
              </div>
            )}
          </div>

          {/* Status Indicator */}
          {!isCollapsed && (
            <div className="mt-3 flex items-center gap-2 px-3 py-2 bg-green-50 rounded-lg">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs font-medium text-green-700">System Online</span>
            </div>
          )}
        </div>
      </div>
    </aside>
    </>
  )
}



