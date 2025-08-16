'use client'
import { usePathname, useRouter } from 'next/navigation'
import React from 'react'

interface MenuItemProps {
  title: string
  to: string
  icon: React.ReactNode
  collapsed?: boolean
  isCommingSoon?: boolean
}

export default function MenuItem({ title, to, icon, collapsed, isCommingSoon }: MenuItemProps) {
  const router = useRouter();
    const pathname = usePathname();

  const isActive = pathname === to

  return (
    <a
      onClick={e => {
        e.preventDefault()
        router.push(to)
      }}
      className={
        "cursor-pointer flex items-center gap-3 px-3 py-3 rounded-lg transition-colors font-medium " +
        (isActive
          ? "bg-gray-700/70 text-white"
          : "text-gray-200 hover:bg-gray-700/70 hover:text-white") +
        (collapsed ? " justify-center" : " justify-start")
      }
    >
      <span className="w-5 h-5">{icon}</span>
      {!collapsed && <span>{title} {isCommingSoon && <span className="bg-yellow-600 text-white text-xs px-2 py-1 rounded-full pl-2">soon</span>}</span>}
    </a>
  )
}