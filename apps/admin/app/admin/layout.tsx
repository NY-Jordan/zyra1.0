'use client'
import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Sidebar } from '@/presentation/components/navigation/Sidebar'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '@zyra/conf/lib/firebase'
import { LoadingSpinner } from '@/presentation/components/LoadingSpinner'
import { HorizontalNavbar } from '@/presentation/components/navigation/HorizontalNavbar'
import "@zyra/ui/globals.css"

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const savedCollapsed = localStorage.getItem('sidebar-collapsed')
    if (savedCollapsed !== null) setCollapsed(JSON.parse(savedCollapsed))
  }, [])

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setCollapsed(true)
        setMobileMenuOpen(false)
      }
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const handleSetCollapsed = (value: boolean | ((prev: boolean) => boolean)) => {
    const newValue = typeof value === 'function' ? value(collapsed) : value
    setCollapsed(newValue)
    localStorage.setItem('sidebar-collapsed', JSON.stringify(newValue))
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) router.replace('/auth/login')
      else setLoading(false)
    })
    return () => unsubscribe()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen w-full bg-[#F8F4F0] dark:bg-[#0C0F16]">
        <LoadingSpinner className="h-8 w-8" />
      </div>
    )
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#F8F4F0] dark:bg-[#0C0F16]">
      {/* Mobile overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
          fixed lg:relative top-0 left-0 z-50 lg:z-auto
          transition-all duration-300 h-screen flex-shrink-0
          ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          ${collapsed ? 'w-[70px]' : 'w-[240px]'}
        `}
      >
        <Sidebar collapsed={collapsed} setCollapsed={handleSetCollapsed} />
      </div>

      {/* Main */}
      <div className="flex-1 min-w-0 h-screen overflow-hidden flex flex-col">
        <div className="flex-shrink-0">
          <HorizontalNavbar
            onMobileMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)}
            isMobileMenuOpen={mobileMenuOpen}
          />
        </div>
        <div className="flex-1 overflow-y-auto">
          <div className="w-full px-4 sm:px-6 py-6">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}
