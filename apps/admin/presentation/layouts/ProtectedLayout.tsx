'use client'
import React, { useEffect, useState, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { Sidebar } from '../components/navigation/Sidebar'
import { Toaster } from '@zyra/ui/components/sonner'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '@zyra/conf/lib/firebase'
import { LoadingSpinner } from '@/presentation/components/LoadingSpinner'
import { Routes } from '@zyra/conf/lib/route'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@zyra/ui/components/breadcrumb"
import { HorizontalNavbar } from '../components/navigation/HorizontalNavbar'

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
  const [collapsed, setCollapsed] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  // Charger l'état collapsed depuis localStorage au montage
  useEffect(() => {
    const savedCollapsed = localStorage.getItem('sidebar-collapsed')
    if (savedCollapsed !== null) {
      setCollapsed(JSON.parse(savedCollapsed))
    }
  }, [])

  // Auto-collapse sur mobile
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setCollapsed(true)
        setMobileMenuOpen(false)
      }
    }

    handleResize() // Check au montage
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Sauvegarder l'état collapsed dans localStorage quand il change
  const handleSetCollapsed = (value: boolean | ((prev: boolean) => boolean)) => {
    const newValue = typeof value === 'function' ? value(collapsed) : value
    setCollapsed(newValue)
    localStorage.setItem('sidebar-collapsed', JSON.stringify(newValue))
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.replace(Routes.auth.login)
      } else {
        setLoading(false)
      }
    })
    return () => unsubscribe()
  }, [router])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen w-full">
        <LoadingSpinner className="h-8 w-8" />
      </div>
    )
  }

  return (
    <div className="flex h-screen overflow-hidden dark:bg-gray-100">
      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <div
        className={`
          fixed lg:relative top-0 left-0 z-50 lg:z-auto
          transition-all duration-300 h-screen text-white flex-shrink-0
          ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          ${collapsed 
            ? 'w-16 sm:w-20 lg:w-16 xl:w-20' 
            : 'w-64 sm:w-72 lg:w-64 xl:w-72 2xl:w-80'
          }
        `}
      >
        <Sidebar 
          collapsed={collapsed} 
          setCollapsed={handleSetCollapsed}
        />
      </div>
      
      {/* Main Content */}
      <div className="flex-1 min-w-0 h-screen overflow-hidden flex flex-col dark:bg-gray-100">
        {/* Horizontal Navbar */}
        <div className="flex-shrink-0 w-full">
          <HorizontalNavbar 
            onMobileMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)}
            isMobileMenuOpen={mobileMenuOpen}
          />
        </div>
        
        {/* Page Content */}
        <div className="flex-1 overflow-y-auto w-full">
          <div className='w-full mb-6 py-3 px-2 sm:px-4 lg:px-6'>
            {pageTitle && (
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold break-words">
                {pageTitle}
              </h1>
            )}
            {breadcrumbs && (
              <div className="mt-2 overflow-x-auto">
                <Breadcrumb>
                  <BreadcrumbList>
                    {breadcrumbs.map((item, idx) => (
                      <React.Fragment key={item.label}>
                        <BreadcrumbItem>
                          {item.href && !item.isCurrent ? (
                            <BreadcrumbLink href={item.href} className="text-sm">
                              {item.label}
                            </BreadcrumbLink>
                          ) : (
                            <BreadcrumbPage className="text-sm">
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
          </div>
          
          <div className='w-full px-2 sm:px-4 lg:px-6 pb-6 dark:bg-gray-100'>
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}
