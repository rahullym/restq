'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  const pathname = usePathname()
  const isActive = pathname === href

  return (
    <Link
      href={href}
      className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors ${
        isActive
          ? 'border-primary-500 text-gray-900'
          : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
      }`}
    >
      {children}
    </Link>
  )
}

interface AdminNavProps {
  userEmail: string
}

export default function AdminNav({ userEmail }: AdminNavProps) {
  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link
                href="/admin/dashboard"
                className="text-xl font-bold text-gray-900 hover:text-primary-600 transition-colors"
              >
                RESq Admin
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <NavLink href="/admin/dashboard">Queue</NavLink>
              <NavLink href="/admin/analytics">Analytics</NavLink>
              <NavLink href="/admin/settings">Settings</NavLink>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-700">{userEmail}</span>
            <a
              href="/api/auth/signout"
              className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              Logout
            </a>
          </div>
        </div>
      </div>
    </nav>
  )
}

