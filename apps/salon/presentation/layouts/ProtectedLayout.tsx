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

type BreadcrumbType = {
  label: string
  href?: string
  isCurrent?: boolean
}

interface ProtectedLayoutProps {
  children: ReactNode
  pageTitle?: string
  breadcrumbs?: BreadcrumbType[]
}

export default function ProtectedLayout({
  children,
  pageTitle,
  breadcrumbs,
}: ProtectedLayoutProps) {
  const [loading, setLoading] = useState(true)
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
      {/* Header Salon */}
      <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo Salon */}
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-lg">S</span>
              </div>
              <span className="ml-3 text-xl font-bold text-gray-900 dark:text-white">
                Salon Admin
              </span>
            </div>

            {/* Navigation rapide */}
            <nav className="hidden md:flex space-x-8">
              <a href="/dashboard" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                Tableau de bord
              </a>
              <a href="/appointments" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                Rendez-vous
              </a>
              <a href="/services" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                Services
              </a>
              <a href="/staff" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                Personnel
              </a>
            </nav>

            {/* Profile Menu */}
            <div className="flex items-center space-x-4">
              <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM5 7h14l-5-5v5z" />
                </svg>
              </button>
              <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumbs */}
        {breadcrumbs && (
          <div className="mb-6">
            <Breadcrumb>
              <BreadcrumbList>
                {breadcrumbs.map((item, idx) => (
                  <React.Fragment key={item.label}>
                    <BreadcrumbItem>
                      {item.href && !item.isCurrent ? (
                        <BreadcrumbLink href={item.href} className="text-sm text-gray-600 dark:text-gray-400">
                          {item.label}
                        </BreadcrumbLink>
                      ) : (
                        <BreadcrumbPage className="text-sm text-gray-900 dark:text-white font-medium">
                          {item.label}
                        </BreadcrumbPage>
                      )}
                    </BreadcrumbItem>
                    {idx < breadcrumbs.length - 1 && <BreadcrumbSeparator />}
                  </React.Fragment>
                ))}
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        )}

        {/* Page Title */}
        {pageTitle && (
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {pageTitle}
            </h1>
          </div>
        )}

        {/* Page Content */}
        <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 dark:border-gray-700/20 p-6">
          {children}
        </div>
      </main>

      <Toaster />
    </div>
  )
}
