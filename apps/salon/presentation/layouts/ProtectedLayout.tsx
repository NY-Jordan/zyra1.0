'use client'
import React, { useEffect, useState, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { Toaster } from '@zyra/ui/components/sonner'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '@zyra/conf/lib/firebase'
import { LoadingSpinner } from '@/presentation/components/LoadingSpinner'
import { Menu, X } from 'lucide-react'
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
  const router = useRouter()

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
      <Navbar />

      <Sidebar 
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <button
        className="fixed left-4 top-4 z-50 rounded-xl border border-slate-200/80 bg-white/85 p-2.5 text-slate-600 shadow-lg shadow-slate-300/40 transition hover:bg-white lg:hidden dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-200 dark:shadow-slate-950/30"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        {sidebarOpen ? (
          <X className="h-5 w-5" />
        ) : (
          <Menu className="h-5 w-5" />
        )}
      </button>

      <main className="h-[calc(100vh-64px)] overflow-y-auto pt-3 lg:ml-72">
        <div className="mx-[4%] mb-10 max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>

      <Toaster />
    </div>
  )
}
