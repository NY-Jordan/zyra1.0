'use client'
import React, { useEffect, useState, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { Toaster } from '@zyra/ui/components/sonner'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '@zyra/conf/lib/firebase'
import { LoadingSpinner } from '@/presentation/components/LoadingSpinner'
import Navbar from '@/presentation/components/layout/Navbar'
import Sidebar from '@/presentation/components/layout/Sidebar'

interface ProtectedLayoutProps {
  children: ReactNode
}

export default function ProtectedLayout({
  children,
}: ProtectedLayoutProps) {
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const router = useRouter()

  // Mémorise la préférence de réduction de la sidebar (desktop)
  useEffect(() => {
    const stored = typeof window !== 'undefined' ? localStorage.getItem('sidebarCollapsed') : null
    if (stored === 'true') setSidebarCollapsed(true)
  }, [])

  const toggleSidebarCollapsed = () => {
    setSidebarCollapsed(prev => {
      const next = !prev
      if (typeof window !== 'undefined') localStorage.setItem('sidebarCollapsed', String(next))
      return next
    })
  }

  // Un seul bouton : sur mobile il ouvre/ferme le tiroir, sur desktop il réduit/étend la sidebar
  const handleToggleSidebar = () => {
    if (typeof window !== 'undefined' && window.innerWidth >= 1024) {
      toggleSidebarCollapsed()
    } else {
      setSidebarOpen(prev => !prev)
    }
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.replace('/auth/login')
      } else {
        setLoading(false)
      }
    })
    return () => unsubscribe()
  }, [router]);

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[radial-gradient(circle_at_top_left,_#dbeafe_0%,_#ecfeff_35%,_#f8fafc_60%)] dark:bg-[radial-gradient(circle_at_top_left,_#0f172a_0%,_#111827_45%,_#020617_100%)]">
        <div className="text-center">
          <LoadingSpinner className="h-12 w-12 mx-auto mb-4" />
          <p className="text-slate-600 dark:text-slate-300">Chargement...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_#dbeafe_0%,_#ecfeff_35%,_#f8fafc_60%)] dark:bg-[radial-gradient(circle_at_top_left,_#0f172a_0%,_#111827_45%,_#020617_100%)]">
      <Navbar onToggleSidebar={handleToggleSidebar} sidebarOpen={sidebarOpen} />

      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        collapsed={sidebarCollapsed}
        onToggleCollapsed={toggleSidebarCollapsed}
      />

      <main className={`h-[calc(100vh-64px)] overflow-y-auto pt-3 transition-[margin] duration-300 ease-in-out ${sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-72'}`}>
        <div className="mx-[4%] mb-10 max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>

      <Toaster />
    </div>
  )
}
