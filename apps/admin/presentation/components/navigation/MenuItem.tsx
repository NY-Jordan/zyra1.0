'use client'
import { usePathname, useRouter } from 'next/navigation'
import React from 'react'

interface MenuItemProps {
  title: string
  to: string
  icon: React.ReactNode
  collapsed?: boolean
  isCommingSoon?: boolean
  horizontal?: boolean
}

export default function MenuItem({ title, to, icon, collapsed, isCommingSoon, horizontal }: MenuItemProps) {
  const router = useRouter();
    const pathname = usePathname();

  const isActive = pathname === to

  // Style pour navigation horizontale
  if (horizontal) {
    return (
      <a
        onClick={e => {
          if(!!isCommingSoon) return ;
          e.preventDefault()
          router.push(to)
        }}
        className={
          "cursor-pointer flex items-center gap-2 px-3 py-2 rounded-lg transition-colors text-sm font-medium " +
          (isActive
            ? "bg-gray-700 text-white"
            : "text-gray-300 hover:bg-gray-700 hover:text-white")
        }
      >
        <span className="w-4 h-4">{icon}</span>
        <span>{title} {isCommingSoon && <span className="bg-yellow-600 text-white text-xs px-1 py-0.5 rounded-full ml-1">soon</span>}</span>
      </a>
    )
  }

  // Style pour navigation verticale (sidebar)
  return (
    <a
      onClick={e => {
        if(!!isCommingSoon) return ;
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