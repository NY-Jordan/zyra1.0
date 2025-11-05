'use client'
import React from 'react'
import { Button } from "@zyra/ui/components/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@zyra/ui/components/popover"
import { Settings, User, LogOut, Building2, ChevronDown, Bell, Store } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { signOut } from 'firebase/auth'
import { auth } from '@zyra/conf/lib/firebase'
import { toast } from 'sonner'
import { useOwner } from '@/hooks/useOwner'
import { useSalon } from '@/hooks/useSalon'
import { useQueryClient } from '@tanstack/react-query'

export default function Navbar() {
  const router = useRouter()
  const { owner } = useOwner()
  const { salon, isConnected, switchSalon, disconnectSalon } = useSalon()
      const queryClient = useQueryClient()

  const handleLogout = async () => {
    try {
      await signOut(auth);
      queryClient.clear();
      toast.success('Déconnexion réussie')
      router.push('/auth/login')
    } catch (error) {
      toast.error('Erreur lors de la déconnexion')
      console.error('Logout error:', error)
    }
  }

  const handleMenuAction = (action: string) => {
    switch (action) {
      case 'profile':
        router.push('/salon/profil')
        break
      case 'settings':
        router.push('/salon/salon-info')
        break
      case 'switch-salon':
        router.push('/salon/switch')
        break
      case 'logout':
        handleLogout()
        break
    }
  }

  return (
    <header className="bg-white/80 w-full dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
      <div className="w-full  px-4 sm:px-6 lg:px-8">
        <div className="flex w-full items-center justify-between h-16">
          {/* Logo Salon */}
          <div className="flex items-center">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <Store className="h-6 w-6 text-white" />
            </div>
            <div className="ml-3">
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                {salon?.name || 'Salon Admin'}
              </h1>
              {salon && (
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {salon.address || 'Aucune adresse'}
                </p>
              )}
            </div>
            {!isConnected && (
              <div className="ml-3 px-2 py-1 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 text-xs rounded-full">
                Non connecté
              </div>
            )}
          </div>

          {/* Actions Menu */}
          <div className="flex items-center space-x-8">
            {/* Notifications Button */}
            <button
              className="relative p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
              onClick={() => router.push('/notifications')}
            >
              <Bell className="h-6 w-6" />
              {/* Badge de notification */}
              <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                3
              </span>
            </button>
            {/* Profile Dropdown Menu */}
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex items-center space-x-2 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <div className="w-8 h-8 rounded-full flex items-center justify-center overflow-hidden">
                    {owner?.photo ? (
                      <img
                        src={owner.photo}
                        alt={owner.name || 'Profile'}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                        <User className="h-4 w-4 text-white" />
                      </div>
                    )}
                  </div>
                  <ChevronDown className="h-4 w-4 text-gray-500" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-56 p-0" align="end">
                <div className="py-1">
                  {/* Owner Info */}
                  {owner && (
                    <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-600">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center overflow-hidden">
                          {owner.photo ? (
                            <img
                              src={owner.photo}
                              alt={owner.name || 'Profile'}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                              <User className="h-5 w-5 text-white" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {owner.name}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            {owner.email}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Salon Info */}
                  {salon && (
                    <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-600">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-blue-600 flex items-center justify-center">
                          <Store className="h-5 w-5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {salon.name}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            {salon.address || 'Aucune adresse'}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Profile */}
                  <button
                    onClick={() => handleMenuAction('profile')}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <User className="h-4 w-4 mr-3" />
                    Profil
                  </button>
                  
                  {/* Settings */}
                  <button
                    onClick={() => handleMenuAction('settings')}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <Settings className="h-4 w-4 mr-3" />
                    Paramètres
                  </button>
                  
                  {/* Switcher de salon */}
                  <button
                    onClick={() => handleMenuAction('switch-salon')}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <Building2 className="h-4 w-4 mr-3" />
                    Switcher de salon
                  </button>
                  
                  {/* Separator */}
                  <div className="border-t border-gray-200 dark:border-gray-600 my-1"></div>
                  
                  {/* Logout */}
                  <button
                    onClick={() => handleMenuAction('logout')}
                    className="flex items-center w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
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
