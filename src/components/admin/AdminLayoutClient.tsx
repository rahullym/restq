'use client'

import { ReactNode } from 'react'
import { SidebarProvider, useSidebar } from '@/contexts/SidebarContext'

function AdminLayoutContent({
  children,
  sidebar,
}: {
  children: ReactNode
  sidebar: ReactNode
}) {
  const { isCollapsed, isMobile, isOpen, setIsOpen } = useSidebar()

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50">
      {/* Mobile Overlay */}
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      {sidebar}
      
      {/* Main Content Area - Adjust margin based on sidebar state */}
      <div
        className={`transition-all duration-300 ${
          isMobile
            ? 'ml-0'
            : isCollapsed
            ? 'ml-20'
            : 'ml-72'
        }`}
      >
        {children}
      </div>
    </div>
  )
}

export default function AdminLayoutClient({
  children,
  sidebar,
}: {
  children: ReactNode
  sidebar: ReactNode
}) {
  return (
    <SidebarProvider>
      <AdminLayoutContent sidebar={sidebar}>
        {children}
      </AdminLayoutContent>
    </SidebarProvider>
  )
}

