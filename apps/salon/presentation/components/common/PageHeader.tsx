'use client'

import React from 'react'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

type BreadcrumbType = {
  label: string
  href?: string
  isCurrent?: boolean
}

interface PageHeaderProps {
  title?: string
  breadcrumbs?: BreadcrumbType[]
  actions?: React.ReactNode
}

export default function PageHeader({ title, breadcrumbs, actions }: PageHeaderProps) {
  return (
    <div className='w-full mb-6 py-3 px-2 sm:px-4 lg:px-6'>
      {breadcrumbs && (
        <nav className="flex mb-2" aria-label="Breadcrumb">
          <ol className="inline-flex items-center space-x-1 md:space-x-2">
            {breadcrumbs.map((item, index) => (
              <li key={index} className="inline-flex items-center">
                {index > 0 && (
                  <ChevronRight className="w-4 h-4 text-gray-400 dark:text-slate-500 mx-1" />
                )}
                {item.href && !item.isCurrent ? (
                  <Link
                    href={item.href}
                    className="text-sm font-medium text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200"
                  >
                    {item.label}
                  </Link>
                ) : (
                  <span className="text-sm font-medium text-gray-700 dark:text-slate-300">
                    {item.label}
                  </span>
                )}
              </li>
            ))}
          </ol>
        </nav>
      )}
      <div className="flex items-center justify-between">
        {title && (
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
            {title}
          </h1>
        )}
        {actions && (
          <div className="flex items-center gap-2">
            {actions}
          </div>
        )}
      </div>
    </div>
  )
}
