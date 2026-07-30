'use client'
import React, { useState } from 'react'
import { useOwner } from '@/hooks/useOwner'
import { useSalon } from '@zyra/core/hooks/useSalon'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { fetchCollection } from '@zyra/conf/lib/query'
import { where } from 'firebase/firestore'
import { ISalon } from '@zyra/conf/domain/entities/salons.entities'
import { Building2, MapPin, ArrowRight, LogOut, CheckCircle, AlertCircle, Scissors, ShieldAlert } from 'lucide-react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { signOut } from 'firebase/auth'
import { auth } from '@zyra/conf/lib/firebase'
import { LogoutauthSalon } from '@/services/ownerAuthService'
import LoadingScreen from '@/presentation/components/common/LoadingScreen'
import { SubscriptionStatus } from '@zyra/conf/domain/entities/subscriptions.entities'

export default function SalonSetupPage() {
  const { owner, isLoading: ownerLoading } = useOwner()
  const { switchSalon } = useSalon()
  const router = useRouter()
  const queryClient = useQueryClient()
  const [selectedSalonId, setSelectedSalonId] = useState<string | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)
  const [noSubSalonId, setNoSubSalonId] = useState<string | null>(null)

  const { data: salons = [], isLoading: salonsLoading } = useQuery({
    queryKey: ['owner-salons', owner?.id],
    queryFn: async () => {
      if (!owner?.id) return []
      return await fetchCollection('salons', [where('ownerId', '==', owner.id)]) as ISalon[]
    },
    enabled: !!owner?.id,
  })

  const handleSelectSalon = async (salonId: string) => {
    setIsConnecting(true)
    setNoSubSalonId(null)
    try {
      const subs = await fetchCollection('subscriptions', [
        where('userId', '==', salonId),
        where('status', '==', SubscriptionStatus.ACTIVE),
      ])
      const hasValidSub = subs.some((s: any) => {
        if (!s.endDate) return true
        const end = new Date(s.endDate.seconds * 1000)
        return end > new Date()
      })
      if (!hasValidSub) {
        setNoSubSalonId(salonId)
        setIsConnecting(false)
        return
      }
      switchSalon(salonId)
      toast.success('Salon connecté !')
      window.location.href = '/salon/dashboard'
    } catch {
      toast.error('Erreur lors de la connexion au salon')
      setIsConnecting(false)
    }
  }

  const handleLogout = async () => {
    try {
      await signOut(auth)
      queryClient.clear()
      LogoutauthSalon()
      router.push('/auth/login')
    } catch {
      toast.error('Erreur lors de la déconnexion')
    }
  }

  if (ownerLoading || salonsLoading) {
    return <LoadingScreen message="Chargement de vos salons..." />
  }

  return (
    <div className="min-h-screen bg-[#F8F4F0] dark:bg-[#0F1117] flex flex-col">

      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-4">
         <>
              <img src="/images/full-logo-light.png" alt="Zyra" className="relative w-32 h-auto dark:hidden" />
              <img src="/images/full-logo-dark.png" alt="Zyra" className="relative hidden w-32 h-auto dark:block" />
            </>

        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-[13px] text-slate-500 dark:text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 transition-colors"
        >
          <div className="w-7 h-7 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-[11px] font-bold text-emerald-700 dark:text-emerald-400">
            {owner?.name?.charAt(0)?.toUpperCase() ?? 'U'}
          </div>
          <span className="hidden sm:block font-medium text-slate-700 dark:text-slate-300">{owner?.name}</span>
          <LogOut className="w-4 h-4" />
        </button>
      </div>

      {/* Main */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">

        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-[28px] sm:text-[32px] font-extrabold text-slate-800 dark:text-white mb-2">
            Quel salon gérez-vous ?
          </h1>
          <p className="text-[14px] text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            Sélectionnez votre salon pour accéder à votre espace de gestion.
          </p>
        </div>

        {/* Salon list */}
        <div className="w-full max-w-lg space-y-3">
          {salons.length === 0 ? (
            <div className="bg-white dark:bg-[#161B24] border border-[#F0EAE4] dark:border-slate-800/50 rounded-2xl p-10 text-center">
              <div className="w-14 h-14 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Building2 className="w-7 h-7 text-slate-400" />
              </div>
              <p className="text-[15px] font-semibold text-slate-700 dark:text-slate-200 mb-1">Aucun salon trouvé</p>
              <p className="text-[13px] text-slate-400 dark:text-slate-500">
                Votre compte n'est associé à aucun salon. Contactez l'équipe Zyra.
              </p>
            </div>
          ) : (
            salons.map((salon) => {
              const isSelected = selectedSalonId === salon.id
              const isConfigured = (salon.progress ?? 0) >= 80
              const photo = Array.isArray(salon.photos) && salon.photos[0]

              return (
                <div key={salon.id} className="space-y-1.5">
              <button
                  onClick={() => { setSelectedSalonId(salon.id); setNoSubSalonId(null) }}
                  className={`w-full text-left rounded-2xl border transition-all duration-150 ${
                    isSelected
                      ? 'bg-white dark:bg-[#161B24] border-emerald-400 dark:border-emerald-500 shadow-md shadow-emerald-100 dark:shadow-emerald-900/20'
                      : 'bg-white dark:bg-[#161B24] border-[#F0EAE4] dark:border-slate-800/50 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-4 p-4">
                    {/* Photo / avatar */}
                    <div className="flex-shrink-0 w-12 h-12 rounded-xl overflow-hidden bg-gradient-to-br from-emerald-100 to-[#F0EAE4] dark:from-emerald-900/30 dark:to-slate-800 flex items-center justify-center">
                      {photo
                        ? <img src={photo} alt={salon.name} className="w-full h-full object-cover" />
                        : <Building2 className="w-6 h-6 text-emerald-500" />
                      }
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-[14px] font-bold text-slate-800 dark:text-white truncate">{salon.name}</p>
                      {(salon.address || salon.city) && (
                        <div className="flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-slate-400 flex-shrink-0" />
                          <span className="text-[12px] text-slate-400 truncate">{salon.address || salon.city}</span>
                        </div>
                      )}
                    </div>

                    {/* Status + selected indicator */}
                    <div className="flex items-center gap-3 flex-shrink-0">
                      {isConfigured
                        ? <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-0.5 rounded-full">
                            <CheckCircle className="w-3 h-3" /> Actif
                          </span>
                        : <span className="flex items-center gap-1 text-[11px] font-semibold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-2 py-0.5 rounded-full">
                            <AlertCircle className="w-3 h-3" /> {salon.progress ?? 0}%
                          </span>
                      }
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                        isSelected
                          ? 'border-emerald-500 bg-emerald-500'
                          : 'border-slate-300 dark:border-slate-600'
                      }`}>
                        {isSelected && <CheckCircle className="w-3 h-3 text-white" />}
                      </div>
                    </div>
                  </div>
                </button>

                {/* Inline no-subscription warning */}
                {noSubSalonId === salon.id && (
                  <div className="flex items-start gap-2 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-800/50 rounded-xl px-4 py-3">
                    <ShieldAlert className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" />
                    <p className="text-[12px] text-rose-600 dark:text-rose-400 leading-relaxed">
                      Ce salon n'a pas de forfait actif. Contactez l'équipe Zyra pour activer votre abonnement.
                    </p>
                  </div>
                )}
              </div>
              )
            })
          )}
        </div>

        {/* CTA */}
        {salons.length > 0 && (
          <div className="mt-8 w-full max-w-lg">
            <button
              onClick={() => selectedSalonId && handleSelectSalon(selectedSalonId)}
              disabled={!selectedSalonId || isConnecting || noSubSalonId === selectedSalonId}
              className="w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-200 dark:disabled:bg-slate-800 disabled:text-slate-400 dark:disabled:text-slate-600 text-white font-semibold text-[14px] py-3.5 rounded-2xl transition-all duration-150 disabled:cursor-not-allowed"
            >
              {isConnecting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Connexion en cours...
                </>
              ) : (
                <>
                  Accéder au tableau de bord
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="py-6 text-center">
        <p className="text-[12px] text-slate-400 dark:text-slate-600">
          Besoin d'aide ? Contactez <span className="text-emerald-500">support@zyra.app</span>
        </p>
      </div>
    </div>
  )
}
