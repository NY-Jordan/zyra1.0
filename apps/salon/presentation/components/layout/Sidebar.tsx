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
  ChevronLeft,
  ChevronRight,
  Activity,
  Bug,
  LifeBuoy,
  ShieldCheck,
} from 'lucide-react'
import { useBookingAccess, BookingAccessState } from '@/hooks/useBookingAccess'
import { useSalonMember } from '@/hooks/useSalonMember'
import { useHasPermission } from '@/hooks/useHasPermission'

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
  /** Clé de permission requise pour un membre (non-owner) ; owner voit toujours tout. */
  permissionKey?: string
  /** Réservé au owner, quel que soit l'état de la matrice de permissions. */
  ownerOnly?: boolean
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
    permissionKey: 'bookings.view',
  },
  {
    label: 'Commandes',
    href: '/salon/orders',
    icon: <ShoppingBag className="h-5 w-5" />,
    requiresBookingAccess: true,
    permissionKey: 'orders.view',
  },
  {
    label: 'Services',
    href: '/salon/services',
    icon: <Scissors className="h-5 w-5" />,
    permissionKey: 'services.view',
  },
  {
    label: 'Coiffeurs',
    href: '/salon/hair-dressers',
    icon: <Users className="h-5 w-5" />,
    permissionKey: 'hairdressers.view',
  },
  {
    label: 'Clients',
    href: '/salon/clients',
    icon: <User2 className="h-5 w-5" />,
    requiresBookingAccess: true,
    permissionKey: 'clients.view',
  },
  {
    label: 'Activités',
    href: '/activities',
    icon: <Activity className="h-5 w-5" />,
    requiresBookingAccess: true,
    permissionKey: 'activities.view',
  },
  {
    label: 'Statistiques',
    href: '/analytics',
    icon: <BarChart3 className="h-5 w-5" />,
    requiresBookingAccess: true,
    permissionKey: 'analytics.view',
  },
  {
    label: 'Administration',
    href: '/salon/administration',
    icon: <ShieldCheck className="h-5 w-5" />,
    ownerOnly: true,
  },
  {
    label: 'Paramètres',
    href: '/salon/salon-info',
    icon: <Settings className="h-5 w-5" />,
    permissionKey: 'settings.view',
  },
]

// ── Sidebar ───────────────────────────────────────────────────────────────────

interface SidebarProps {
  isOpen?: boolean
  onClose?: () => void
  collapsed?: boolean
  onToggleCollapsed?: () => void
}

export default function Sidebar({ isOpen = true, onClose, collapsed = false, onToggleCollapsed }: SidebarProps) {
  const pathname = usePathname()
  const access = useBookingAccess()
  const { isReady } = access
  const { member } = useSalonMember()
  const { hasPermission } = useHasPermission()

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/')

  const visibleItems = sidebarItems.filter(item => {
    if (!member) return true // owner : accès complet
    if (item.ownerOnly) return false
    if (!item.permissionKey) return true
    return hasPermission(item.permissionKey)
  })

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-20 bg-slate-950/50 backdrop-blur-[1px] lg:hidden"
          onClick={onClose}
        />
      )}

      <aside className={`
        fixed left-0 top-16 z-30 h-[calc(100vh-4rem)] border-r border-[#F0EAE4] bg-white/90 backdrop-blur-xl
        transition-all duration-300 ease-in-out dark:border-slate-800/70 dark:bg-[#10141b]/90
        ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0
        ${collapsed ? 'w-72 lg:w-20' : 'w-72'}
      `}>
        {/* Bouton de réduction (desktop uniquement) */}
        {onToggleCollapsed && (
          <button
            type="button"
            onClick={onToggleCollapsed}
            aria-label={collapsed ? 'Étendre la barre latérale' : 'Réduire la barre latérale'}
            className="absolute -right-3 top-8 z-10 hidden h-6 w-6 items-center justify-center rounded-full border border-[#F0EAE4] bg-white text-slate-500 shadow-md transition-colors hover:bg-[#F5F2EF] hover:text-slate-800 lg:flex dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
          >
            {collapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
          </button>
        )}

        <div className="flex h-full flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto overflow-x-hidden px-3 py-5">
          <nav className="space-y-1.5">
            {visibleItems.map((item) => {
              const locked = item.requiresBookingAccess && !isReady
              const active = isActive(item.href)

              if (locked) {
                return (
                  <LockedItemTooltip key={item.href} access={access}>
                    <div
                      title={collapsed ? item.label : undefined}
                      className={`flex w-full items-center rounded-xl px-3 py-2.5 text-sm font-medium cursor-not-allowed opacity-40 select-none ${collapsed ? 'lg:justify-center lg:px-0' : ''}`}
                    >
                      <span className={`${collapsed ? 'mr-3 lg:mr-0' : 'mr-3'} text-slate-400 dark:text-slate-500`}>
                        {item.icon}
                      </span>
                      <span className={`flex-1 text-left text-slate-500 dark:text-slate-500 ${collapsed ? 'lg:hidden' : ''}`}>
                        {item.label}
                      </span>
                      <Lock className={`h-3.5 w-3.5 text-slate-300 dark:text-slate-600 ${collapsed ? 'lg:hidden' : ''}`} />
                    </div>
                  </LockedItemTooltip>
                )
              }

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  title={collapsed ? item.label : undefined}
                  className={`
                    group flex w-full cursor-pointer items-center rounded-xl px-3 py-2.5 text-sm font-medium transition-all
                    ${collapsed ? 'lg:justify-center lg:px-0' : ''}
                    ${active
                      ? 'bg-emerald-50 text-emerald-700 shadow-sm ring-1 ring-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:ring-emerald-800/50'
                      : 'text-slate-600 hover:bg-[#F5F2EF] hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800/60 dark:hover:text-white'
                    }
                  `}
                >
                  <span className={`${collapsed ? 'mr-3 lg:mr-0' : 'mr-3'} ${active ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 group-hover:text-slate-600 dark:text-slate-500 dark:group-hover:text-slate-300'}`}>
                    {item.icon}
                  </span>
                  <span className={`flex-1 text-left ${collapsed ? 'lg:hidden' : ''}`}>{item.label}</span>
                  {item.badge && (
                    <span className={`inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-rose-500 rounded-full ${collapsed ? 'lg:hidden' : ''}`}>
                      {item.badge}
                    </span>
                  )}
                </Link>
              )
            })}
          </nav>
        </div>

        {/* Bas de sidebar : aide et support */}
        <div className="border-t border-[#F0EAE4] px-3 py-3 space-y-1.5 dark:border-slate-800/50">
          <button
            type="button"
            title={collapsed ? 'Signaler un problème' : undefined}
            className={`group flex w-full cursor-pointer items-center rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 transition-all hover:bg-[#F5F2EF] hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800/60 dark:hover:text-white ${collapsed ? 'lg:justify-center lg:px-0' : ''}`}
          >
            <span className={`${collapsed ? 'mr-3 lg:mr-0' : 'mr-3'} text-slate-400 group-hover:text-slate-600 dark:text-slate-500 dark:group-hover:text-slate-300`}>
              <Bug className="h-5 w-5" />
            </span>
            <span className={`flex-1 text-left ${collapsed ? 'lg:hidden' : ''}`}>Signaler un problème</span>
          </button>

          <button
            type="button"
            title={collapsed ? 'Contacter le support' : undefined}
            className={`group flex w-full cursor-pointer items-center rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 transition-all hover:bg-[#F5F2EF] hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800/60 dark:hover:text-white ${collapsed ? 'lg:justify-center lg:px-0' : ''}`}
          >
            <span className={`${collapsed ? 'mr-3 lg:mr-0' : 'mr-3'} text-slate-400 group-hover:text-slate-600 dark:text-slate-500 dark:group-hover:text-slate-300`}>
              <LifeBuoy className="h-5 w-5" />
            </span>
            <span className={`flex-1 text-left ${collapsed ? 'lg:hidden' : ''}`}>Contacter le support</span>
          </button>
        </div>
        </div>
      </aside>
    </>
  )
}
