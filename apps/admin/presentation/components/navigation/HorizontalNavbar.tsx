'use client'

import { Calendar, Menu, X, Bell } from "lucide-react"
import { useRouter } from "next/navigation"
import { ProfileMenu } from "./ProfileMenu"

interface HorizontalNavbarProps {
  onMobileMenuToggle?: () => void
  isMobileMenuOpen?: boolean
}

export function HorizontalNavbar({ onMobileMenuToggle, isMobileMenuOpen }: HorizontalNavbarProps) {
  const router = useRouter()

  return (
    <nav className="bg-white dark:bg-[#13161E] border-b border-[#F0EAE4] dark:border-slate-800/60 flex-shrink-0">
      <div className="w-full px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">

          {/* Mobile: hamburger */}
          <button
            onClick={onMobileMenuToggle}
            className="lg:hidden w-9 h-9 flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-600 hover:bg-[#F8F4F0] dark:hover:bg-slate-800 transition-colors"
            aria-label="Menu"
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

          {/* Desktop: page context / greeting */}
          <div className="hidden lg:block">
            <p className="text-[13px] text-slate-400 dark:text-slate-500">
              Bonne journée 👋 — Bienvenue sur Zyra Admin
            </p>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => router.push('/admin/reservations')}
              className="relative w-9 h-9 flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-600 hover:bg-[#F8F4F0] dark:hover:bg-slate-800 dark:hover:text-slate-300 transition-colors"
              title="Réservations"
            >
              <Calendar className="h-[18px] w-[18px]" />
            </button>
            <button
              className="relative w-9 h-9 flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-600 hover:bg-[#F8F4F0] dark:hover:bg-slate-800 dark:hover:text-slate-300 transition-colors"
              title="Notifications"
            >
              <Bell className="h-[18px] w-[18px]" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-500 border-2 border-white dark:border-[#13161E]" />
            </button>
            <div className="w-px h-6 bg-[#F0EAE4] dark:bg-slate-800 mx-2" />
            <ProfileMenu />
          </div>

        </div>
      </div>
    </nav>
  )
}
