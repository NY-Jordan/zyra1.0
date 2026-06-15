'use client'
import React, { useState, useRef, useCallback } from 'react'
import { createPortal } from 'react-dom'
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
  User2,
  Lock,
  Check,
  Send,
  UserCheck,
} from 'lucide-react'
import { useBookingAccess, BookingAccessState } from '@/hooks/useBookingAccess'

// ── Portal tooltip ────────────────────────────────────────────────────────────

const STEPS = [
  {
    key: 'hasServices' as keyof BookingAccessState,
    icon: Scissors,
    done: 'Service créé',
    todo: 'Créer au moins un service',
    href: '/salon/services',
  },
  {
    key: 'hasInvitation' as keyof BookingAccessState,
    icon: Send,
    done: 'Invitation envoyée',
    todo: 'Envoyer une invitation à un coiffeur',
    href: '/salon/hair-dressers',
  },
  {
    key: 'hasValidatedHairdresser' as keyof BookingAccessState,
    icon: UserCheck,
    done: 'Coiffeur actif',
    todo: 'En attente de validation du coiffeur',
    href: null,
  },
]

function LockedItemTooltip({
  children,
  access,
}: {
  children: React.ReactNode
  access: BookingAccessState
}) {
  const [visible, setVisible] = useState(false)
  const [pos, setPos] = useState({ top: 0, left: 0 })
  const ref = useRef<HTMLDivElement>(null)

  const handleEnter = useCallback(() => {
    if (!ref.current) return
    const rect = ref.current.getBoundingClientRect()
    setPos({ top: rect.top + rect.height / 2, left: rect.right + 10 })
    setVisible(true)
  }, [])

  // Find current blocking step
  const currentStepIndex = STEPS.findIndex(s => !access[s.key])

  return (
    <div ref={ref} onMouseEnter={handleEnter} onMouseLeave={() => setVisible(false)}>
      {children}
      {visible && typeof document !== 'undefined' && createPortal(
        <div
          className="pointer-events-none fixed z-[9999]"
          style={{ top: pos.top, left: pos.left, transform: 'translateY(-50%)' }}
        >
          {/* Arrow */}
          <div className="absolute -left-1.5 top-1/2 -translate-y-1/2 w-0 h-0 border-y-[6px] border-y-transparent border-r-[6px] border-r-slate-900" />

          <div className="bg-slate-900 text-white rounded-2xl px-4 py-3.5 w-64 shadow-2xl shadow-black/40">
            {/* Header */}
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 rounded-lg bg-slate-700 flex items-center justify-center flex-shrink-0">
                <Lock className="w-3 h-3 text-slate-300" />
              </div>
              <div>
                <p className="text-[12px] font-bold text-white leading-tight">Section verrouillée</p>
                {currentStepIndex >= 0 && (
                  <p className="text-[10px] text-slate-400 leading-tight">
                    Étape {currentStepIndex + 1}/{STEPS.length} manquante
                  </p>
                )}
              </div>
            </div>

            {/* Steps */}
            <div className="space-y-2">
              {STEPS.map((step, i) => {
                const done = !!access[step.key]
                const isCurrent = i === currentStepIndex
                const Icon = step.icon
                return (
                  <div
                    key={step.key}
                    className={`flex items-start gap-2.5 rounded-xl px-2.5 py-2 transition-colors ${
                      done
                        ? 'opacity-50'
                        : isCurrent
                        ? 'bg-amber-500/15 border border-amber-500/30'
                        : 'opacity-40'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5 ${
                      done ? 'bg-emerald-500' : isCurrent ? 'bg-amber-500' : 'bg-slate-700'
                    }`}>
                      {done
                        ? <Check className="w-3 h-3 text-white" />
                        : <Icon className="w-3 h-3 text-white" />
                      }
                    </div>
                    <div className="min-w-0">
                      <p className={`text-[11px] font-semibold leading-tight ${
                        done ? 'text-emerald-400' : isCurrent ? 'text-amber-300' : 'text-slate-400'
                      }`}>
                        {done ? step.done : step.todo}
                      </p>
                      {isCurrent && !done && step.href && (
                        <p className="text-[10px] text-amber-500/70 mt-0.5">
                          → Aller dans la section concernée
                        </p>
                      )}
                      {isCurrent && !done && !step.href && (
                        <p className="text-[10px] text-slate-500 mt-0.5">
                          En attente d'action du coiffeur
                        </p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}

// ── Sidebar items ─────────────────────────────────────────────────────────────

interface SidebarItem {
  label: string
  href: string
  icon: React.ReactNode
  badge?: string
  requiresBookingAccess?: boolean
}

const sidebarItems: SidebarItem[] = [
  {
    label: 'Tableau de bord',
    href: '/salon/dashboard',
    icon: <LayoutDashboard className="h-5 w-5" />,
  },
  {
    label: 'Rendez-vous',
    href: '/salon/reservations',
    icon: <Calendar className="h-5 w-5" />,
    requiresBookingAccess: true,
  },
  {
    label: 'Commandes',
    href: '/salon/orders',
    icon: <ShoppingBag className="h-5 w-5" />,
    requiresBookingAccess: true,
  },
  {
    label: 'Services',
    href: '/salon/services',
    icon: <Scissors className="h-5 w-5" />,
  },
  {
    label: 'Coiffeurs',
    href: '/salon/hair-dressers',
    icon: <Users className="h-5 w-5" />,
  },
  {
    label: 'Clients',
    href: '/salon/clients',
    icon: <User2 className="h-5 w-5" />,
    requiresBookingAccess: true,
  },
  {
    label: 'Statistiques',
    href: '/analytics',
    icon: <BarChart3 className="h-5 w-5" />,
    requiresBookingAccess: true,
  },
  {
    label: 'Paramètres',
    href: '/salon/salon-info',
    icon: <Settings className="h-5 w-5" />,
  },
]

// ── Sidebar ───────────────────────────────────────────────────────────────────

interface SidebarProps {
  isOpen?: boolean
  onClose?: () => void
}

export default function Sidebar({ isOpen = true, onClose }: SidebarProps) {
  const pathname = usePathname()
  const access = useBookingAccess()
  const { isReady } = access

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/')

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
            {sidebarItems.map((item) => {
              const locked = item.requiresBookingAccess && !isReady
              const active = isActive(item.href)

              if (locked) {
                return (
                  <LockedItemTooltip key={item.href} access={access}>
                    <div className="flex w-full items-center rounded-xl px-3 py-2.5 text-sm font-medium cursor-not-allowed opacity-40 select-none">
                      <span className="mr-3 text-slate-400 dark:text-slate-500">
                        {item.icon}
                      </span>
                      <span className="flex-1 text-left text-slate-500 dark:text-slate-500">
                        {item.label}
                      </span>
                      <Lock className="h-3.5 w-3.5 text-slate-300 dark:text-slate-600" />
                    </div>
                  </LockedItemTooltip>
                )
              }

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={`
                    group flex w-full cursor-pointer items-center rounded-xl px-3 py-2.5 text-sm font-medium transition-all
                    ${active
                      ? 'bg-gradient-to-r from-sky-500/10 via-cyan-500/10 to-teal-500/10 text-sky-700 shadow-sm ring-1 ring-sky-500/20 dark:text-sky-300 dark:ring-sky-400/25'
                      : 'text-slate-700 hover:bg-slate-100/80 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800/60 dark:hover:text-white'
                    }
                  `}
                >
                  <span className={`mr-3 ${active ? 'text-sky-600 dark:text-sky-300' : 'text-slate-500 group-hover:text-slate-700 dark:text-slate-400 dark:group-hover:text-slate-200'}`}>
                    {item.icon}
                  </span>
                  <span className="flex-1 text-left">{item.label}</span>
                  {item.badge && (
                    <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-500 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </Link>
              )
            })}
          </nav>
        </div>
      </aside>
    </>
  )
}
