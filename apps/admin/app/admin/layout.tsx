'use client'
import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Sidebar } from '@/presentation/components/navigation/Sidebar'
import { Toaster } from '@zyra/ui/components/sonner'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '@zyra/conf/lib/firebase'
import { LoadingSpinner } from '@/presentation/components/LoadingSpinner'
import { HorizontalNavbar } from '@/presentation/components/navigation/HorizontalNavbar'
import { Geist, Geist_Mono } from "next/font/google"
import "@zyra/ui/globals.css"
import { Providers } from "@/components/providers"
import ReactQueryProvider from "@/presentation/layouts/ReactQueryProvider";
const fontSans = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
})

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export default function RootLayout({
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
  }, [router])

  if (loading) {
    return (
      <html lang="en" suppressHydrationWarning>
      <body
        className={`${fontSans.variable} ${fontMono.variable} font-sans antialiased `}
      >
      <div className="flex items-center justify-center h-screen w-full">
        <LoadingSpinner className="h-8 w-8" />
      </div>
      </body>
      </html>
    )
  }


  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${fontSans.variable} ${fontMono.variable} font-sans antialiased `}
      >
        <Providers>
          <ReactQueryProvider>
            <div className="flex h-screen overflow-hidden dark:bg-gray-100">
              {mobileMenuOpen && (
                <div 
                  className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                  onClick={() => setMobileMenuOpen(false)}
                />
              )}
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
              <div className="flex-1 min-w-0 h-screen overflow-hidden flex flex-col dark:bg-gray-100">
                <div className="flex-shrink-0 w-full">
                  <HorizontalNavbar 
                    onMobileMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)}
                    isMobileMenuOpen={mobileMenuOpen}
                  />
                </div>
                <div className="flex-1 overflow-y-auto w-full">
                  <div className='w-full px-2 sm:px-4 lg:px-6 pb-6 dark:bg-gray-100'>
                    {children}
                  </div>
                </div>
              </div>
              <Toaster position="top-right" />
            </div>
          </ReactQueryProvider>
        </Providers>
      </body>
    </html>
  )
}
