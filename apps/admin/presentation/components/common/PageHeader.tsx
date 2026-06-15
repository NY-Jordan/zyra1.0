'use client'

import React from 'react'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

type Crumb = { label: string; href?: string; isCurrent?: boolean }

interface PageHeaderProps {
  title?: string
  breadcrumbs?: Crumb[]
  actions?: React.ReactNode
}

export default function PageHeader({ title, breadcrumbs, actions }: PageHeaderProps) {
  return (
    <div className="mb-6">
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav className="flex mb-1.5">
          <ol className="inline-flex items-center gap-1">
            {breadcrumbs.map((item, i) => (
              <li key={i} className="inline-flex items-center gap-1">
                {i > 0 && <ChevronRight className="w-3 h-3 text-slate-300 dark:text-slate-600" />}
                {item.href && !item.isCurrent ? (
                  <Link href={item.href} className="text-[12px] text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 transition-colors">
                    {item.label}
                  </Link>
                ) : (
                  <span className="text-[12px] text-slate-400 dark:text-slate-500">{item.label}</span>
                )}
              </li>
            ))}
          </ol>
        </nav>
      )}
      <div className="flex items-center justify-between gap-4">
        {title && (
          <h1 className="text-[20px] font-bold text-slate-800 dark:text-white tracking-tight">{title}</h1>
        )}
        {actions && (
          <div className="flex items-center gap-2 flex-shrink-0">{actions}</div>
        )}
      </div>
    </div>
  )
}
