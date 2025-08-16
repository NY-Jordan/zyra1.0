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
  Settings,
  ChevronLeft,
  ChevronRight
} from "lucide-react"
import { Avatar, AvatarImage, AvatarFallback } from "@zyra/ui/components/avatar"
import MenuItem from "./MenuItem"
import clsx from "clsx"
import { signOut } from "firebase/auth"
import { auth } from "@zyra/conf/lib/firebase"

const menu = [
  { icon: <LayoutGrid className="h-5 w-5" />, label: "Tableau de bord", to: "/" },
  { icon: <Building2 className="h-5 w-5" />, label: "Salons", to: "/salons" },
  { icon: <Scissors className="h-5 w-5" />, label: "Coiffeurs", to: "/hair-dressers" },
  { icon: <User className="h-5 w-5" />, label: "Utilisateurs", to: "/utilisateurs", isComingSoon : true },
  { icon: <Calendar className="h-5 w-5" />, label: "Réservations", to: "/reservations" },
  { icon: <CreditCard className="h-5 w-5" />, label: "Transactions", to: "/transactions", isComingSoon : true },
  { icon: <Wrench className="h-5 w-5" />, label: "Services", to: "/services" },
  { icon: <Settings className="h-5 w-5" />, label: "Paramètres", to: "/settings" },
]

export function Sidebar({collapsed, setCollapsed}: {collapsed: boolean, setCollapsed: React.Dispatch<React.SetStateAction<boolean>>}) {

  const handleLogout = async () => {
    await signOut(auth)
    window.location.href = "/auth/login"
  }

  return (
    <div
      className={clsx(
        "h-screen px-3 pt-2 bg-gray-800 font-sans transition-all duration-300 flex flex-col",
        collapsed ? "w-20" : "w-full min-w-[220px]"
      )}
    >
      <div className={clsx("flex items-center", collapsed ? "justify-center" : "ml-5 pr-2")}>
        <Avatar className={clsx("transition-all duration-300", collapsed ? "w-10 h-10" : "w-16 h-16")}>
          <AvatarImage src="https://github.com/shadcn.png" />
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>
        {!collapsed && (
          <>
            <div className="flex-1 ml-4">
              <h1 className="text-white text-lg font-semibold mt-2">Yvan Jordan NGUETSE</h1>
              <p className="text-gray-400 text-sm">ynguetse@gmail.com</p>
            </div>
            <button
              onClick={() => setCollapsed((v) => !v)}
              className="ml-2 flex items-center justify-center rounded bg-gray-700 hover:bg-gray-600 transition-colors w-8 h-8"
              aria-label="Toggle sidebar"
            >
              <span>
                <ChevronLeft className={clsx("text-white transition-transform", !collapsed ? "" : "rotate-180")} />
              </span>
            </button>
          </>
        )}
        {collapsed && (
          <button
            onClick={() => setCollapsed((v) => !v)}
            className="ml-2 flex items-center justify-center rounded bg-gray-700 hover:bg-gray-600 transition-colors w-10 h-10"
            aria-label="Toggle sidebar"
          >
            <ChevronRight className="text-white" />
          </button>
        )}
      </div>
      <nav className={clsx("mt-10 space-y-2 flex-1")}>
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
              <span className="absolute left-full top-1/2 -translate-y-1/2 ml-2 z-10 opacity-0 group-hover:opacity-100 pointer-events-none transition bg-gray-900 text-white text-xs rounded px-2 py-1 shadow-lg whitespace-nowrap">
                {item.label}
              </span>
            )}
          </div>
        ))}
      </nav>
      <button
        onClick={handleLogout}
        className={clsx(
          "w-full flex items-center justify-center gap-2 py-2 mt-4 mb-2 rounded bg-red-600 hover:bg-red-700 text-white font-semibold transition-colors",
          collapsed ? "justify-center px-0" : "px-4"
        )}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H7a2 2 0 01-2-2V7a2 2 0 012-2h4a2 2 0 012 2v1" />
        </svg>
        {!collapsed && <span>Déconnexion</span>}
      </button>
    </div>
  )
}
