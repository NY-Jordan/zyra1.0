'use client'

import { useState, useRef, useEffect } from 'react'
import { Settings, User, LogOut } from 'lucide-react'
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

  // Fermer le menu quand on clique ailleurs
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  return (
    <div className="relative" ref={menuRef}>
      {/* Bouton avec icône paramètres et avatar */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center  gap-2 p-1 rounded-full hover:cursor-pointer  hover:bg-gray-600 transition-colors"
      >
        <Avatar className="w-10 h-10">
          <AvatarImage src="/apps/admin/assets/avatar.jpg" />
          <AvatarFallback className="bg-blue-500 text-white text-sm">YN</AvatarFallback>
        </Avatar>
      </button>

      {/* Menu déroulant */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-lg shadow-lg border border-gray-700 z-50">
          <div className="py-2">
            {/* Mon profil */}
            <button
              onClick={() => {
                setIsOpen(false)
                // Navigation vers profil
                window.location.href = "/profile"
              }}
              className="w-full flex items-center gap-3 px-4 py-2 text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
            >
              <User className="h-4 w-4" />
              <span>Mon profil</span>
            </button>

            {/* Séparateur */}
            <div className="border-t border-gray-700 my-1"></div>

            {/* Logout */}
            <button
              onClick={() => {
                setIsOpen(false)
                handleLogout()
              }}
              className="w-full flex items-center gap-3 px-4 py-2 text-red-400 hover:bg-red-600 hover:text-white transition-colors"
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
