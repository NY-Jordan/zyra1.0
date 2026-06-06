'use client'
import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Calendar,
  Scissors,
  Users,
  Settings,
  BarChart3,
  ShoppingBag,
  User2
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
  },
   {
    label: 'Commandes',
    href: '/salon/orders',
    icon: <ShoppingBag className="h-5 w-5" />
  },
  {
    label: 'Services',
    href: '/salon/services',
    icon: <Scissors className="h-5 w-5" />
  },
  {
    label: 'Coiffeurs',
    href: '/salon/hair-dressers',
    icon: <Users className="h-5 w-5" />
  },
  {
    label: 'Clients',
    href: '/salon/clients',
    icon: <User2 className="h-5 w-5" />
  },
  {
    label: 'Statistiques',
    href: '/analytics',
    icon: <BarChart3 className="h-5 w-5" />
  },
  {
    label: 'Paramètres',
    href: '/salon/salon-info',
    icon: <Settings className="h-5 w-5" />
  }
]

interface SidebarProps {
  isOpen?: boolean
  onClose?: () => void
}

export default function Sidebar({ isOpen = true, onClose }: SidebarProps) {
  const pathname = usePathname()

  const isActive = (href: string) => {
    return pathname === href || pathname.startsWith(href + '/')
  }

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-20 bg-slate-950/50 backdrop-blur-[1px] lg:hidden"
          onClick={onClose}
        />
      )}

      <aside className={`
        fixed left-0 top-16 z-30 h-[calc(100vh-4rem)] w-72 border-r border-slate-200/80 bg-white/75 backdrop-blur-xl
        transition-transform duration-300 ease-in-out dark:border-slate-700/70 dark:bg-slate-900/70
        ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0
      `}>
        <div className="h-full overflow-y-auto px-4 py-5">
          <div className="mb-4 rounded-2xl border border-slate-200/80 bg-white/80 px-3 py-2.5 text-xs font-medium text-slate-600 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-300">
            Navigation principale
          </div>

          <nav className="space-y-1.5">
            {sidebarItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`
                  group flex w-full cursor-pointer items-center rounded-xl px-3 py-2.5 text-sm font-medium transition-all
                  ${isActive(item.href)
                    ? 'bg-gradient-to-r from-sky-500/10 via-cyan-500/10 to-teal-500/10 text-sky-700 shadow-sm ring-1 ring-sky-500/20 dark:text-sky-300 dark:ring-sky-400/25'
                    : 'text-slate-700 hover:bg-slate-100/80 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800/60 dark:hover:text-white'
                  }
                `}
              >
                <span className={`mr-3 ${isActive(item.href) ? 'text-sky-600 dark:text-sky-300' : 'text-slate-500 group-hover:text-slate-700 dark:text-slate-400 dark:group-hover:text-slate-200'}`}>
                  {item.icon}
                </span>
                <span className="flex-1 text-left">{item.label}</span>
                {item.badge && (
                  <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-500 rounded-full">
                    {item.badge}
                  </span>
                )}
              </Link>
            ))}
          </nav>
        </div>
      </aside>
    </>
  )
}
