'use client'

import { useState, useRef, useEffect } from 'react'
import { User, LogOut, ChevronDown } from 'lucide-react'
import { Avatar, AvatarImage, AvatarFallback } from "@zyra/ui/components/avatar"
import { signOut } from "firebase/auth"
import { auth } from "@zyra/conf/lib/firebase"

export function ProfileMenu() {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  const handleLogout = async () => {
    await signOut(auth)
    window.location.href = "/auth/login"
  }

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-[#F8F4F0] dark:hover:bg-slate-800 transition-colors"
      >
        <Avatar className="w-7 h-7">
          <AvatarImage src="/assets/avatar.jpg" />
          <AvatarFallback className="bg-emerald-500 text-white text-xs font-bold">A</AvatarFallback>
        </Avatar>
        <span className="hidden sm:block text-sm font-medium text-slate-700 dark:text-slate-200">Admin</span>
        <ChevronDown className={`h-3.5 w-3.5 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-[#1A1F2E] rounded-2xl shadow-xl border border-[#F0EAE4] dark:border-slate-800/60 z-50 overflow-hidden">
          {/* User info header */}
          <div className="px-4 py-3 border-b border-[#F8F4F0] dark:border-slate-800/60">
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">Administrateur</p>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">Zyraa Platform</p>
          </div>
          <div className="py-1.5">
            <button
              onClick={() => { setIsOpen(false); window.location.href = "/profile" }}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 dark:text-slate-300 hover:bg-[#F8F4F0] dark:hover:bg-slate-800/60 transition-colors"
            >
              <User className="h-4 w-4 text-slate-400" />
              <span>Mon profil</span>
            </button>
            <div className="border-t border-[#F8F4F0] dark:border-slate-800 my-1" />
            <button
              onClick={() => { setIsOpen(false); handleLogout() }}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              <span>Déconnexion</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
