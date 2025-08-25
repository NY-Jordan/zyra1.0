'use client'

import { useState } from "react"
import {
  LayoutGrid,
  Building2,
  Scissors,
  User,
  Calendar,
  CreditCard,
  Wrench,
  Package,
  Settings,
  ChevronLeft,
  ChevronRight,
  Sparkles
} from "lucide-react"
import { Logo } from "../common/Logo"
import MenuItem from "./MenuItem"
import clsx from "clsx"

const menu = [
  { icon: <LayoutGrid className="h-5 w-5" />, label: "Tableau de bord", to: "/admin" },
  { icon: <Building2 className="h-5 w-5" />, label: "Salons", to: "/admin/salons" },
  { icon: <Scissors className="h-5 w-5" />, label: "Coiffeurs", to: "/admin/hair-dressers" },
  { icon: <User className="h-5 w-5" />, label: "Utilisateurs", to: "/admin/utilisateurs", isComingSoon : true },
  { icon: <Calendar className="h-5 w-5" />, label: "Réservations", to: "/admin/reservations" },
  { icon: <CreditCard className="h-5 w-5" />, label: "Transactions", to: "/admin/transactions", isComingSoon : true },
  { icon: <Wrench className="h-5 w-5" />, label: "Services", to: "/admin/services" },
  { icon: <Package className="h-5 w-5" />, label: "Forfaits", to: "/admin/packages" },
  { icon: <Sparkles className="h-5 w-5" />, label: "Fonctionnalités Salon", to: "/admin/features" },
  { icon: <Settings className="h-5 w-5" />, label: "Paramètres", to: "/admin/settings" },
]

interface SidebarProps {
  collapsed: boolean
  setCollapsed: React.Dispatch<React.SetStateAction<boolean>>
  onMobileMenuToggle?: () => void
}

export function Sidebar({collapsed, setCollapsed, onMobileMenuToggle}: SidebarProps) {

  return (
    <div
      className={clsx(
        "h-screen px-4 py-6 bg-gradient-to-b from-gray-800 to-gray-900 font-sans transition-all duration-300 flex flex-col border-r border-gray-700",
        collapsed ? "w-full" : "w-full min-w-[260px]"
      )}
    >
      {/* Header avec Logo */}
      <div className={clsx("flex items-center mb-8", collapsed ? "justify-center" : "justify-between")}>
        <Logo 
          size={collapsed ? "sm" : "md"} 
          showText={!collapsed}
          className={collapsed ? "" : ""}
        />
        <button
          onClick={() => setCollapsed((v) => !v)}
          className="flex items-center justify-center ml-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors w-8 h-8 text-gray-300 hover:text-white"
          aria-label="Toggle sidebar"
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Navigation Menu */}
      <nav className="space-y-2 flex-1">
        {menu.map((item) => (
          <div key={item.label} className="relative group">
            <MenuItem
              title={item.label}
              isCommingSoon={item.isComingSoon}
              to={item.to}
              icon={item.icon}
              collapsed={collapsed}
            />
            {collapsed && (
              <span className="absolute left-full top-1/2 -translate-y-1/2 ml-3 z-10 opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 bg-gray-900 text-white text-sm rounded-lg px-3 py-2 shadow-xl whitespace-nowrap border border-gray-700">
                {item.label}
              </span>
            )}
          </div>
        ))}
      </nav>

      {/* User Info (optionnel) */}
      {!collapsed && (
        <div className="mt-6 pt-6 border-t border-gray-700">
          <div className="text-gray-400 text-sm">
            <div className="font-medium text-gray-200">Yvan Jordan NGUETSE</div>
            <div className="text-xs">ynguetse@gmail.com</div>
          </div>
        </div>
      )}
    </div>
  )
}
