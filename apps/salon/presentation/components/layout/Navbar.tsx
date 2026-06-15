'use client'
import React from 'react'
import Link from 'next/link'
import { Button } from "@zyra/ui/components/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@zyra/ui/components/popover"
import {
  Settings,
  User,
  LogOut,
  Building2,
  ChevronDown,
  Bell,
  Store,
  Sun,
  Moon,
  Monitor,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { signOut } from 'firebase/auth'
import { auth } from '@zyra/conf/lib/firebase'
import { toast } from 'sonner'
import { useOwner } from '@/hooks/useOwner'
import { useSalon } from '@/hooks/useSalon'
import { useQueryClient } from '@tanstack/react-query'
import { useTheme } from 'next-themes'
import { LogoutauthSalon } from '@/services/ownerAuthService'

export default function Navbar() {
  const router = useRouter()
  const { owner } = useOwner()
  const { salon, isConnected } = useSalon()
  const { theme, setTheme } = useTheme()
  const queryClient = useQueryClient()

  const handleLogout = async () => {
    try {
      await signOut(auth);
      queryClient.clear();
      LogoutauthSalon();
      toast.success('Déconnexion réussie')
      router.push('/auth/login')
    } catch (error) {
      toast.error('Erreur lors de la déconnexion')
      console.error('Logout error:', error)
    }
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/70 bg-white/70 backdrop-blur-xl dark:border-slate-700/70 dark:bg-slate-900/65">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex w-full items-center justify-between h-16">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 via-cyan-500 to-teal-500 shadow-lg shadow-cyan-500/20">
              <Store className="h-6 w-6 text-white" />
            </div>
            <div className="min-w-0">
              <h1 className="truncate text-lg font-semibold tracking-tight text-slate-900 dark:text-white">
                {salon?.name || 'Salon Admin'}
              </h1>
              {salon && (
                <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                  {salon.address || 'Aucune adresse'}
                </p>
              )}
            </div>
            {!isConnected && (
              <div className="hidden rounded-full border border-amber-300/70 bg-amber-100/80 px-2 py-1 text-xs text-amber-800 md:block dark:border-amber-800 dark:bg-amber-900/40 dark:text-amber-200">
                Non connecté
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-xl text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
                  aria-label="Changer le thème"
                >
                  {theme === 'dark' ? <Moon className="h-5 w-5" /> : theme === 'light' ? <Sun className="h-5 w-5" /> : <Monitor className="h-5 w-5" />}
                </Button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-52 p-1">
                <button
                  onClick={() => setTheme('light')}
                  className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-slate-700 transition-colors hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  <Sun className="h-4 w-4" />
                  Clair
                </button>
                <button
                  onClick={() => setTheme('dark')}
                  className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-slate-700 transition-colors hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  <Moon className="h-4 w-4" />
                  Sombre
                </button>
                <button
                  onClick={() => setTheme('system')}
                  className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-slate-700 transition-colors hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  <Monitor className="h-4 w-4" />
                  Système
                </button>
              </PopoverContent>
            </Popover>

            <Link
              href="/notifications"
              className="relative rounded-xl p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-xs text-white">
                3
              </span>
            </Link>

            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  className="h-11 rounded-2xl border border-slate-200/70 bg-white/80 px-2 text-left hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900/70 dark:hover:bg-slate-800"
                >
                  <div className="h-8 w-8 overflow-hidden rounded-full">
                    {owner?.photo ? (
                      <img
                        src={owner.photo}
                        alt={owner.name || 'Profile'}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-sky-500 to-teal-500">
                        <User className="h-4 w-4 text-white" />
                      </div>
                    )}
                  </div>
                  <div className="hidden min-w-0 px-1 sm:block">
                    <p className="truncate text-sm font-medium text-slate-800 dark:text-slate-100">
                      {owner?.name || 'Mon compte'}
                    </p>
                  </div>
                  <ChevronDown className="h-4 w-4 text-slate-500" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64 p-0" align="end">
                <div className="py-1">
                  {owner && (
                    <div className="border-b border-slate-200 px-4 py-3 dark:border-slate-700">
                      <div className="flex items-center space-x-3">
                        <div className="h-10 w-10 overflow-hidden rounded-full">
                          {owner.photo ? (
                            <img
                              src={owner.photo}
                              alt={owner.name || 'Profile'}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-sky-500 to-teal-500">
                              <User className="h-5 w-5 text-white" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="truncate text-sm font-medium text-slate-900 dark:text-white">
                            {owner.name}
                          </p>
                          <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                            {owner.email}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {salon && (
                    <div className="border-b border-slate-200 px-4 py-3 dark:border-slate-700">
                      <div className="flex items-center space-x-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500">
                          <Store className="h-5 w-5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="truncate text-sm font-medium text-slate-900 dark:text-white">
                            {salon.name}
                          </p>
                          <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                            {salon.address || 'Aucune adresse'}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  <Link
                    href="/salon/profil"
                    className="flex w-full items-center px-4 py-2 text-sm text-slate-700 transition-colors hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                  >
                    <User className="h-4 w-4 mr-3" />
                    Profil
                  </Link>

                  <Link
                    href="/salon/salon-info"
                    className="flex w-full items-center px-4 py-2 text-sm text-slate-700 transition-colors hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                  >
                    <Settings className="h-4 w-4 mr-3" />
                    Paramètres
                  </Link>

                  <Link
                    href="/salon/switch"
                    className="flex w-full items-center px-4 py-2 text-sm text-slate-700 transition-colors hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                  >
                    <Building2 className="h-4 w-4 mr-3" />
                    Switcher de salon
                  </Link>

                  <div className="my-1 border-t border-slate-200 dark:border-slate-700"></div>

                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center px-4 py-2 text-sm text-rose-600 transition-colors hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-900/20"
                  >
                    <LogOut className="h-4 w-4 mr-3" />
                    Se déconnecter
                  </button>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>
    </header>
  )
}
