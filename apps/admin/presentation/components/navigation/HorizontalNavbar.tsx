'use client'

import {
  LayoutGrid,
  Building2,
  Scissors,
  User,
  Calendar,
  CreditCard,
  Wrench,
  Settings,
  Calendar1,
  Menu,
  X
} from "lucide-react"
import { useRouter } from "next/navigation"
import MenuItem from "./MenuItem"
import { ProfileMenu } from "./ProfileMenu"

interface HorizontalNavbarProps {
  onMobileMenuToggle?: () => void
  isMobileMenuOpen?: boolean
}

export function HorizontalNavbar({ onMobileMenuToggle, isMobileMenuOpen }: HorizontalNavbarProps) {
  const router = useRouter()

  const handleCalendarClick = () => {
    router.push('/reservations')
  }

  return (
    <nav className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 border-b border-gray-600/50 backdrop-blur-sm">
      <div className="w-full mx-auto px-2 sm:px-4 lg:px-6 xl:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* Mobile menu button - Left */}
          <div className="lg:hidden">
            <button 
              onClick={onMobileMenuToggle}
              className="bg-gray-700 inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-600 transition-colors"
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>

          {/* Bouton Calendrier avec tooltip - Center on mobile, Left on desktop */}
          <div className="flex-shrink-0 relative group lg:mr-auto">
            <div className="relative">
              {/* Effet de glow en arrière-plan */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 rounded-2xl blur-lg opacity-30 group-hover:opacity-60 transition-opacity duration-300"></div>
              <button
                onClick={handleCalendarClick}
                className="relative flex hover:cursor-pointer items-center justify-center w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-600 hover:from-blue-400 hover:via-indigo-500 hover:to-purple-500 rounded-2xl shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 transform hover:scale-110 hover:-translate-y-1 border border-white/20"
                aria-label="Calendrier des réservations"
              >
                <Calendar1 className="h-4 w-4 sm:h-5 sm:w-5 text-white drop-shadow-lg" />
                {/* Petite animation de pulse */}
                <div className="absolute inset-0 rounded-2xl bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </button>
            </div>
            {/* Tooltip amélioré */}
            <div className="absolute left-full top-1/2 transform -translate-y-1/2 ml-3 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none z-[9999] hidden sm:block">
              <div className="bg-black/90 backdrop-blur-md text-white text-sm rounded-xl px-4 py-3 shadow-2xl whitespace-nowrap border border-white/20 font-medium">
                📅 Calendrier des réservations
                <div className="absolute top-1/2 -left-2 transform -translate-y-1/2 w-4 h-4 bg-black/90 border-l border-b border-white/20 rotate-45"></div>
              </div>
            </div>
          </div>

          {/* Profile Menu - Right */}
          <div className="flex items-center gap-2 sm:gap-4">
            <ProfileMenu />
          </div>
        </div>
      </div>
    </nav>
  )
}
