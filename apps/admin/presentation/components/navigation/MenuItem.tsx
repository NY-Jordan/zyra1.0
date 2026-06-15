'use client'
import { usePathname, useRouter } from 'next/navigation'
import React from 'react'
import clsx from 'clsx'

interface MenuItemProps {
  title: string
  to: string
  icon: React.ReactNode
  collapsed?: boolean
  isCommingSoon?: boolean
}

export default function MenuItem({ title, to, icon, collapsed, isCommingSoon }: MenuItemProps) {
  const router = useRouter()
  const pathname = usePathname()
  // Exact match for dashboard, prefix match for all other sections
  const isActive = to === '/admin'
    ? pathname === '/admin'
    : pathname.startsWith(to)

  return (
    <a
      onClick={e => {
        if (isCommingSoon) return
        e.preventDefault()
        router.push(to)
      }}
      className={clsx(
        "cursor-pointer flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-all duration-150 text-[13px] select-none",
        isActive
          ? "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 font-semibold"
          : "text-slate-500 dark:text-slate-400 hover:bg-[#F5F2EF] dark:hover:bg-slate-800/60 hover:text-slate-700 dark:hover:text-slate-200",
        collapsed && "justify-center px-2"
      )}
    >
      <span className={clsx(
        "flex-shrink-0 transition-colors",
        isActive ? "text-emerald-600 dark:text-emerald-400" : "text-slate-400 dark:text-slate-500"
      )}>
        {icon}
      </span>
      {!collapsed && (
        <span className="flex items-center gap-2 flex-1 min-w-0">
          <span className="truncate">{title}</span>
          {isCommingSoon && (
            <span className="text-[9px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 rounded-md px-1.5 py-0.5 flex-shrink-0">
              soon
            </span>
          )}
        </span>
      )}
    </a>
  )
}
