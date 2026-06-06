'use client'
import React, { useState, useEffect } from 'react'
import { Button } from '@zyra/ui/components/button'
import { Card, CardContent } from '@zyra/ui/components/card'
import { useOwner } from '@/hooks/useOwner'
import { useSalon } from '@/hooks/useSalon'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { fetchCollection } from '@zyra/conf/lib/query'
import { where } from 'firebase/firestore'
import { ISalon } from '@zyra/conf/domain/entities/salons.entities'
import { Building2, CheckCircle, AlertCircle, ArrowRight, ChevronDown, LogOut, User } from 'lucide-react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import LoadingScreen from '@/presentation/components/common/LoadingScreen'
import SalonList from '@/presentation/components/salon/SalonList'
import { signOut } from 'firebase/auth'
import { auth } from '@zyra/conf/lib/firebase'

export default function SalonSetupPage() {
  const { owner, isLoading: ownerLoading, isAuthenticated } = useOwner()
  const { switchSalon } = useSalon()
  const router = useRouter()
  const [selectedSalonId, setSelectedSalonId] = useState<string | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)
  const [showUserDropdown, setShowUserDropdown] = useState(false)
  const queryClient = useQueryClient()

  // Fonction pour gérer l'ajout d'un nouveau salon
  const handleAddNewSalon = () => {
    // TODO: Implémenter la navigation vers la création de salon
    toast.info('Fonctionnalité de création de salon à venir')
  }

  // Fonction de déconnexion
  const handleLogout = async () => {
    console.log('Déconnexion en cours...')
    try {
      await signOut(auth)
      queryClient.clear()
      toast.success('Déconnexion réussie')
      router.push('/auth/login')
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error)
      toast.error('Erreur lors de la déconnexion')
    }
  }

  // Fermer le dropdown quand on clique ailleurs
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showUserDropdown) {
        setShowUserDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showUserDropdown])

  // Récupérer les salons du propriétaire connecté
  const { data: salons = [], isLoading: salonsLoading } = useQuery({
    queryKey: ['owner-salons', owner?.id],
    queryFn: async () => {
      if (!owner?.id) return []
      const result = await fetchCollection('salons', [
        where('ownerId', '==', owner.id)
      ])
      return result as ISalon[]
    },
    enabled: !!owner?.id,
  })

  const handleSelectSalon = async (salonId: string) => {
    setIsConnecting(true)
    try {
      switchSalon(salonId)
      toast.success('Salon sélectionné avec succès!')
      window.location.href = '/salon/dashboard'
    } catch (error) {
      console.error('Erreur lors de la sélection du salon:', error)
      toast.error('Erreur lors de la sélection du salon')
    } finally {
      setIsConnecting(false)
    }
  }

  if (!isAuthenticated || ownerLoading) {
    return <LoadingScreen message="Chargement de votre profil..." />
  }

  if (salonsLoading) {
    return <LoadingScreen message="Chargement de vos salons..." />
  }

  if (!owner) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Accès non autorisé</h2>
            <p className="text-gray-600 dark:text-slate-400 mb-6">Vous devez être connecté pour accéder à cette page.</p>
            <Button onClick={() => {
                handleLogout();
                router.push('/auth/login')
            }} className="w-full">
              Se connecter
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (salons.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <Building2 className="h-12 w-12 text-gray-400 dark:text-slate-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Aucun salon trouvé</h2>
            <p className="text-gray-600 dark:text-slate-400 mb-6">
              Vous ne possédez aucun salon pour le moment. Veuillez contacter le support pour créer votre salon.
            </p>
            <Button onClick={() => router.push('/auth/login')} variant="outline" className="w-full">
              Retour à la connexion
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div className="text-center flex-1">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Sélectionnez votre salon</h1>
              <p className="text-gray-600 dark:text-slate-400">Choisissez le salon que vous souhaitez gérer</p>
            </div>
            {/* Dropdown utilisateur */}
            <div className="relative">
              <button
                onClick={() =>
           handleLogout()
                    }
                className="flex items-center gap-3 bg-gray-50 dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg px-4 py-2 transition-colors"
              >
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    {owner.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <span className="text-sm font-medium text-gray-700 dark:text-slate-300">{owner.name}</span>
                <ChevronDown className="h-4 w-4 text-gray-500 dark:text-slate-400" />
              </button>

              {/* Dropdown menu */}
              {showUserDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-gray-200 dark:border-slate-700 py-1 z-10">
                  <button
                    onClick={() =>
           handleLogout()
                    }
                    className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
                  >
                    <LogOut className="h-4 w-4" />
                    Se déconnecter
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Liste des salons */}
        <div className="mb-8">
          <SalonList
            salons={salons}
            selectedSalonId={selectedSalonId}
            onSalonSelect={setSelectedSalonId}
            onAddNewSalon={handleAddNewSalon}
          />
        </div>

        {/* Bouton d'action */}
        <div className="text-center">
          <Button
            onClick={() => selectedSalonId && handleSelectSalon(selectedSalonId)}
            disabled={!selectedSalonId || isConnecting}
            size="lg"
            className="px-8"
          >
            {isConnecting ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                Connexion en cours...
              </>
            ) : (
              <>
                Accéder au tableau de bord
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center">
          <p className="text-sm text-gray-500 dark:text-slate-500">
            Besoin d'aide ? Contactez notre équipe support
          </p>
        </div>
      </div>
    </div>
  )
}
