'use client'
import React from 'react'
import { useRouter, usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Calendar,
  Scissors,
  Users,
  Settings,
  BarChart3,
  CreditCard,
  Package,
  Store,
  X
} from 'lucide-react'

interface SidebarItem {
  label: string
  href: string
  icon: React.ReactNode
  badge?: string
}

const sidebarItems: SidebarItem[] = [
  {
    label: 'Tableau de bord',
    href: '/salon/dashboard',
    icon: <LayoutDashboard className="h-5 w-5" />
  },
  {
    label: 'Rendez-vous',
    href: '/salon/reservations',
    icon: <Calendar className="h-5 w-5" />,
    badge: '12'
  },
  {
    label: 'Services',
    href: '/salon/services',
    icon: <Scissors className="h-5 w-5" />
  },
  {
    label: 'Coiffeur',
    href: '/salon/staff',
    icon: <Users className="h-5 w-5" />
  },
  {
    label: 'Clients',
    href: '/salon/clients',
    icon: <Users className="h-5 w-5" />
  },
  {
    label: 'Statistiques',
    href: '/analytics',
    icon: <BarChart3 className="h-5 w-5" />
  },
  {
    label: 'Paramètres',
    href: '/settings',
    icon: <Settings className="h-5 w-5" />
  }
]

interface SidebarProps {
  isOpen?: boolean
  onClose?: () => void
}

export default function Sidebar({ isOpen = true, onClose }: SidebarProps) {
  const router = useRouter()
  const pathname = usePathname()

  const isActive = (href: string) => {
    return pathname === href || pathname.startsWith(href + '/')
  }

  const handleNavigation = (href: string) => {
    router.push(href)
    onClose?.()
  }

  return (
    <>
      {/* Overlay pour mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-gray-600 bg-opacity-50 z-20 lg:hidden"
          onClick={onClose}
        />
      )}
      {/* Sidebar */}
      <aside className={`
        fixed top-16 left-0 z-30 w-64 h-[calc(100vh-4rem)] bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm 
        border-r border-gray-200 dark:border-gray-700 transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0
      `}>
        <div className="h-full px-3 py-4 overflow-y-auto">
          <nav className="space-y-2">
            {sidebarItems.map((item) => (
              <button
                key={item.href}
                onClick={() => handleNavigation(item.href)}
                className={`
                  flex hover:cursor-pointer items-center w-full px-3 py-2.5 text-sm font-medium rounded-lg transition-colors
                  ${isActive(item.href) 
                    ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400' 
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }
                `}
              >
                <span className={`mr-3 ${isActive(item.href) ? 'text-blue-700 dark:text-blue-400' : ''}`}>
                  {item.icon}
                </span>
                <span className="flex-1 text-left">{item.label}</span>
                {item.badge && (
                  <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-500 rounded-full">
                    {item.badge}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>
      </aside>
    </>
  )
}
