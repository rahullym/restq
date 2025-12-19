'use client'

import { createContext, useContext, ReactNode, useState, useEffect } from 'react'

interface SidebarContextType {
  isCollapsed: boolean
  setIsCollapsed: (collapsed: boolean) => void
  isMobile: boolean
  isOpen: boolean
  setIsOpen: (open: boolean) => void
}

const SidebarContext = createContext<SidebarContextType>({
  isCollapsed: false,
  setIsCollapsed: () => {},
  isMobile: false,
  isOpen: false,
  setIsOpen: () => {},
})

export const useSidebar = () => useContext(SidebarContext)

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768
      setIsMobile(mobile)
      if (mobile) {
        setIsCollapsed(true)
        setIsOpen(false)
      }
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  return (
    <SidebarContext.Provider value={{ isCollapsed, setIsCollapsed, isMobile, isOpen, setIsOpen }}>
      {children}
    </SidebarContext.Provider>
  )
}

