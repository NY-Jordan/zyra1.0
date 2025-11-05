'use client'
import React, { useEffect, useState, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { Toaster } from '@zyra/ui/components/sonner'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '@zyra/conf/lib/firebase'
import { LoadingSpinner } from '@/presentation/components/LoadingSpinner'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@zyra/ui/components/breadcrumb"
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
  }, [router])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen w-full bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center">
          <LoadingSpinner className="h-12 w-12 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-300">Chargement...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* Navbar */}
      <Navbar />
      {/* Sidebar */}
      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
      />

      {/* Mobile menu button */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-white dark:bg-gray-800 shadow-lg"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        {sidebarOpen ? (
          <X className="h-6 w-6 text-gray-600 dark:text-gray-300" />
        ) : (
          <Menu className="h-6 w-6 text-gray-600 dark:text-gray-300" />
        )}
      </button>

      {/* Main Content */}
      <main className="lg:ml-64 pt-2">
        <div className="max-w-7xl mx-auto  sm:px-6 lg:px-2 py-8">
          {children}
        </div>
      </main>

      <Toaster />
    </div>
  )
}
