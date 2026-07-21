'use client'

import {
  LayoutGrid, Building2, Scissors, User, Calendar, CreditCard,
  Wrench, Package, Settings, Sparkles, KeyRound, ChevronLeft, PanelLeftClose, PanelLeftOpen
} from "lucide-react"
import MenuItem from "./MenuItem"
import clsx from "clsx"

const nav = [
  { icon: LayoutGrid, label: "Tableau de bord", to: "/admin" },
  { icon: Building2,  label: "Salons",           to: "/admin/salons" },
  { icon: Scissors,   label: "Coiffeurs",         to: "/admin/hair-dressers" },
  { icon: User,       label: "Utilisateurs",      to: "/admin/utilisateurs", soon: true },
  { icon: Calendar,   label: "Réservations",      to: "/admin/reservations" },
  { icon: CreditCard, label: "Transactions",      to: "/admin/transactions" },
  { icon: Wrench,     label: "Services",          to: "/admin/services" },
  { icon: Package,    label: "Forfaits",          to: "/admin/packages" },
  { icon: Sparkles,   label: "Fonctionnalités",   to: "/admin/features" },
  { icon: KeyRound,   label: "Permissions",       to: "/admin/permissions" },
  { icon: Settings,   label: "Paramètres",        to: "/admin/settings" },
]

interface SidebarProps {
  collapsed: boolean
  setCollapsed: React.Dispatch<React.SetStateAction<boolean>>
}

function ZMark() {
  return (
    <div className="w-8 h-8 rounded-xl bg-emerald-500 flex items-center justify-center flex-shrink-0 shadow-sm">
      <svg width="15" height="15" viewBox="0 0 32 32" fill="none">
        <path d="M6 7H26L6 25H26" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  )
}

export function Sidebar({ collapsed, setCollapsed }: SidebarProps) {
  return (
    <div className="h-screen w-full flex flex-col bg-white dark:bg-[#13161E] border-r border-[#F0EAE4] dark:border-slate-800/60">

      {/* Logo */}
      <div className={clsx(
        "h-16 flex items-center flex-shrink-0 border-b border-[#F0EAE4] dark:border-slate-800/60 px-4",
        collapsed ? "justify-center" : "gap-3"
      )}>
        <ZMark />
        {!collapsed && (
          <>
            <span className="text-[15px] font-semibold text-slate-800 dark:text-white tracking-tight flex-1">
              Zyra
            </span>
            <button
              onClick={() => setCollapsed(true)}
              className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <PanelLeftClose className="w-4 h-4" />
            </button>
          </>
        )}
        {collapsed && (
          <button
            onClick={() => setCollapsed(false)}
            className="absolute -right-3 top-[3.75rem] w-6 h-6 rounded-full bg-white dark:bg-[#13161E] border border-[#F0EAE4] dark:border-slate-700 flex items-center justify-center shadow-sm text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors z-10"
            aria-label="Expand"
          >
            <ChevronLeft className="w-3 h-3 rotate-180" />
          </button>
        )}
      </div>

      {/* Nav items */}
      <nav className="flex-1 overflow-y-auto py-4 px-2.5 space-y-0.5">
        {nav.map(item => {
          const Icon = item.icon
          return (
            <div key={item.label} className="relative group">
              <MenuItem
                title={item.label}
                to={item.to}
                icon={<Icon className="h-[17px] w-[17px]" />}
                collapsed={collapsed}
                isCommingSoon={item.soon}
              />
              {collapsed && (
                <div className="absolute left-full top-1/2 -translate-y-1/2 ml-4 z-50 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-150">
                  <div className="bg-slate-900 dark:bg-slate-700 text-white text-xs font-medium rounded-lg px-3 py-2 shadow-xl whitespace-nowrap">
                    {item.label}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </nav>

      {/* User footer */}
      {!collapsed && (
        <div className="px-3 py-4 border-t border-[#F0EAE4] dark:border-slate-800/60 flex-shrink-0">
          <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-[#F8F4F0] dark:bg-slate-800/50">
            <div className="w-7 h-7 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
              <span className="text-white text-[11px] font-bold">A</span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-200 truncate">Administrateur</p>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate">Zyra Platform</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
