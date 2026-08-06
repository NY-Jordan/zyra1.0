'use client'
import React, { useEffect } from 'react'
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
  Store,
  Sun,
  Moon,
  Monitor,
  Menu,
  PanelLeftClose,
  ShieldCheck,
} from 'lucide-react'
import { NotificationBell } from '@/presentation/components/notifications/NotificationBell'
import { useRouter } from 'next/navigation'
import { signOut } from 'firebase/auth'
import { auth } from '@zyra/conf/lib/firebase'
import { toast } from 'sonner'
import { useOwner } from '@/hooks/useOwner'
import { useSalon } from '@zyra/core/hooks/useSalon'
import { useQueryClient } from '@tanstack/react-query'
import { useTheme } from 'next-themes'
import { LogoutauthSalon } from '@/services/ownerAuthService'
import { setCachedActorName } from '@zyra/core/usecases/notificationsUseCases'
import useSalonMember from '@/hooks/useSalonMember'

interface NavbarProps {
  onToggleSidebar?: () => void
  sidebarOpen?: boolean
}

export default function Navbar({ onToggleSidebar, sidebarOpen }: NavbarProps) {
  const router = useRouter()
  const { owner } = useOwner()
  const { member } = useSalonMember()
  const { salon, isConnected } = useSalon()
  const { theme, setTheme } = useTheme()
  const queryClient = useQueryClient()

  // Tient à jour le nom affiché comme "auteur" dans le journal d'activité
  // (voir `getCurrentActor`), owner ou membre.
  useEffect(() => {
    setCachedActorName(member?.name || owner?.name || null)
  }, [member?.name, owner?.name])

  const handleLogout = async () => {
    try {
      await signOut(auth);
      queryClient.clear();
      setCachedActorName(null);
      LogoutauthSalon();
      toast.success('Déconnexion réussie')
      router.push('/auth/login')
    } catch (error) {
      toast.error('Erreur lors de la déconnexion')
      console.error('Logout error:', error)
    }
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#F0EAE4] bg-white/80 backdrop-blur-xl dark:border-slate-800/70 dark:bg-[#10141b]/80">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex w-full items-center justify-between h-16">
          <div className="flex min-w-0 items-center gap-3">
            {onToggleSidebar && (
              <button
                type="button"
                onClick={onToggleSidebar}
                aria-label="Basculer la barre latérale"
                className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl text-slate-500 transition-colors hover:bg-[#F5F2EF] hover:text-slate-800 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                <span className="hidden lg:flex"><PanelLeftClose className="h-5 w-5" /></span>
                <span className="flex lg:hidden">{sidebarOpen ? <PanelLeftClose className="h-5 w-5" /> : <Menu className="h-5 w-5" />}</span>
              </button>
            )}

            <div className="flex h-10 w-10 items-center justify-center rounded-2xl overflow-hidden shadow-sm shadow-emerald-500/20 flex-shrink-0">
              {salon?.logo
                ? <img src={salon.logo} alt={salon.name} className="w-full h-full object-cover" />
                : <>
                  <img src="/images/icon-light.png" alt="Zyraa" className="relative w-44 h-auto dark:hidden" />
                  <img src="/images/icon-dark.png" alt="Zyraa" className="relative hidden w-44 h-auto dark:block" />
                </>
              }
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
                  className="rounded-xl text-slate-600 hover:bg-[#F5F2EF] hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
                  aria-label="Changer le thème"
                >
                  {theme === 'dark' ? <Moon className="h-5 w-5" /> : theme === 'light' ? <Sun className="h-5 w-5" /> : <Monitor className="h-5 w-5" />}
                </Button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-52 p-1 rounded-2xl border-[#F0EAE4] dark:border-slate-800/50">
                <button
                  onClick={() => setTheme('light')}
                  className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-slate-700 transition-colors hover:bg-[#F5F2EF] dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  <Sun className="h-4 w-4" />
                  Clair
                </button>
                <button
                  onClick={() => setTheme('dark')}
                  className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-slate-700 transition-colors hover:bg-[#F5F2EF] dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  <Moon className="h-4 w-4" />
                  Sombre
                </button>
                <button
                  onClick={() => setTheme('system')}
                  className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-slate-700 transition-colors hover:bg-[#F5F2EF] dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  <Monitor className="h-4 w-4" />
                  Système
                </button>
              </PopoverContent>
            </Popover>

            <NotificationBell salonId={salon?.id ?? null} />

            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  className="h-11 rounded-2xl border border-[#F0EAE4] bg-white/80 px-2 text-left hover:bg-[#F5F2EF] dark:border-slate-800/50 dark:bg-slate-900/70 dark:hover:bg-slate-800"
                >
                  <div className="h-8 w-8 overflow-hidden rounded-full">
                    {owner?.photo ? (
                      <img
                        src={owner.photo}
                        alt={owner.name || 'Profile'}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-emerald-500 to-teal-500">
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
              <PopoverContent className="w-64 p-0 rounded-2xl border-[#F0EAE4] dark:border-slate-800/50" align="end">
                <div className="py-1">
                  {owner && (
                    <div className="border-b border-[#F0EAE4] px-4 py-3 dark:border-slate-800/50">
                      <div className="flex items-center space-x-3">
                        <div className="h-10 w-10 overflow-hidden rounded-full">
                          {owner.photo ? (
                            <img
                              src={owner.photo}
                              alt={owner.name || 'Profile'}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-emerald-500 to-teal-500">
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
                    <div className="border-b border-[#F0EAE4] px-4 py-3 dark:border-slate-800/50">
                      <div className="flex items-center space-x-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl overflow-hidden flex-shrink-0">
                          {salon.logo
                            ? <img src={salon.logo} alt={salon.name} className="w-full h-full object-cover" />
                            : <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-emerald-500 to-teal-500"><Store className="h-5 w-5 text-white" /></div>
                          }
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
                    className="flex w-full items-center px-4 py-2 text-sm text-slate-700 transition-colors hover:bg-[#F5F2EF] dark:text-slate-200 dark:hover:bg-slate-800"
                  >
                    <User className="h-4 w-4 mr-3" />
                    Profil
                  </Link>

                  <Link
                    href="/salon/salon-info"
                    className="flex w-full items-center px-4 py-2 text-sm text-slate-700 transition-colors hover:bg-[#F5F2EF] dark:text-slate-200 dark:hover:bg-slate-800"
                  >
                    <Settings className="h-4 w-4 mr-3" />
                    Paramètres
                  </Link>

                  {!member && (
                    <Link
                      href="/salon/administration"
                      className="flex w-full items-center px-4 py-2 text-sm text-slate-700 transition-colors hover:bg-[#F5F2EF] dark:text-slate-200 dark:hover:bg-slate-800"
                    >
                      <ShieldCheck className="h-4 w-4 mr-3" />
                      Administration
                    </Link>
                  )}

                  {!member && (
                    <Link
                      href="/salon/switch"
                      className="flex w-full items-center px-4 py-2 text-sm text-slate-700 transition-colors hover:bg-[#F5F2EF] dark:text-slate-200 dark:hover:bg-slate-800"
                    >
                      <Building2 className="h-4 w-4 mr-3" />
                      Switcher de salon
                    </Link>
                  )}

                  <div className="my-1 border-t border-[#F0EAE4] dark:border-slate-800/50"></div>

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
