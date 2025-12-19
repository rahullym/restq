'use client'

import { useSidebar } from '@/contexts/SidebarContext'

export default function MobileMenuButton() {
  const { isMobile, isOpen, setIsOpen } = useSidebar()

  if (!isMobile) {
    return null
  }

  return (
    <button
      onClick={() => setIsOpen(!isOpen)}
      className="p-2.5 bg-gray-100 rounded-lg hover:bg-gray-200 active:bg-gray-300 transition-all active:scale-95 md:hidden flex items-center justify-center min-w-[44px] min-h-[44px]"
      aria-label={isOpen ? 'Close menu' : 'Open menu'}
    >
      <span className="text-2xl font-bold text-gray-700">{isOpen ? '×' : '☰'}</span>
    </button>
  )
}
