'use client'
import React, { useEffect, useState, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { Sidebar } from '../components/navigation/Sidebar'
import { Toaster } from '@zyra/ui/components/sonner'
import { onAuthStateChanged, getAuth } from 'firebase/auth'
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
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const auth = getAuth()
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
    <div className="flex flex-row w-full flex-1 h-screen">
      <div
        className={`transition-all duration-300 ${
          collapsed ? 'w-[60px]' : 'w-[20%]'
        } h-screen text-white`}
      >
        <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      </div>
      <div
        className={`transition-all duration-300 ${
          collapsed ? 'ml-[60px]' : 'ml-[0%]'
        } w-0 flex-1 h-screen p-4 overflow-y-auto`}
      >
        <div className='w-full mb-6'>
          {pageTitle && (
            <h1 className="text-2xl font-bold ">{pageTitle}</h1>
          )}
          {breadcrumbs && (
            <Breadcrumb>
              <BreadcrumbList>
                {breadcrumbs.map((item, idx) => (
                  <React.Fragment key={item.label}>
                    <BreadcrumbItem>
                      {item.href && !item.isCurrent ? (
                        <BreadcrumbLink href={item.href}>{item.label}</BreadcrumbLink>
                      ) : (
                        <BreadcrumbPage>{item.label}</BreadcrumbPage>
                      )}
                    </BreadcrumbItem>
                    {idx < breadcrumbs.length - 1 && <BreadcrumbSeparator />}
                  </React.Fragment>
                ))}
              </BreadcrumbList>
            </Breadcrumb>
          )}
        </div>
        {children}
      </div>
    </div>
  )
}
