'use client'
import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSalon } from '@/hooks/useSalon'
import { useQuery } from '@tanstack/react-query'
import { fetchCollection } from '@zyra/conf/lib/query'
import { where } from 'firebase/firestore'
import { ISubscription, SubscriptionStatus } from '@zyra/conf/domain/entities/subscriptions.entities'
import LoadingScreen from '@/presentation/components/common/LoadingScreen'
import SalonConfigModal from '@/presentation/components/modals/SalonConfigModal'
import SalonLocationForm from '@/presentation/components/SalonLocationForm'
import { signOut } from 'firebase/auth'
import { auth } from '@zyra/conf/lib/firebase'
import { toast } from 'sonner'

const SESSION_DURATION = 2 * 60 * 60 * 1000 // 2 heures

interface SalonCheckerProps {
  children: React.ReactNode
}

export default function SalonChecker({ children }: SalonCheckerProps) {
  const { isConnected, salon, salonId, isLoading } = useSalon()
  const router = useRouter()
  const [isChecking, setIsChecking] = useState(true)
  const [showConfigModal, setShowConfigModal] = useState(false)
  const [showLocationModal, setShowLocationModal] = useState(false)

  const { data: subscription, isLoading: subLoading } = useQuery({
    queryKey: ['salon-subscription-check', salonId],
    enabled: !!salonId,
    staleTime: 60_000,
    queryFn: async () => {
      const subs = await fetchCollection('subscriptions', [where('userId', '==', salonId)])
      if (!subs.length) return null
      const active = subs.find((s: any) => s.status === SubscriptionStatus.ACTIVE)
      if (active) return active as ISubscription
      const sorted = [...subs].sort(
        (a: any, b: any) => (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0)
      )
      return sorted[0] as ISubscription
    },
  })

  const hasValidSubscription = (() => {
    if (!subscription) return false
    if (subscription.status !== SubscriptionStatus.ACTIVE) return false
    if (subscription.endDate) {
      const end = new Date((subscription.endDate as any).seconds * 1000)
      return end > new Date()
    }
    return true
  })()

  // Session expiry: 2h from login, also cleared when browser is closed (sessionStorage)
  useEffect(() => {
    const loginTime = sessionStorage.getItem('salonLoginTime')
    if (!loginTime) return

    const elapsed = Date.now() - parseInt(loginTime)
    if (elapsed >= SESSION_DURATION) {
      signOut(auth)
      sessionStorage.clear()
      router.push('/auth/login')
      return
    }

    const remaining = SESSION_DURATION - elapsed
    const t = setTimeout(async () => {
      await signOut(auth)
      sessionStorage.clear()
      toast.info('Votre session a expiré. Veuillez vous reconnecter.')
      router.push('/auth/login')
    }, remaining)

    return () => clearTimeout(t)
  }, [router])

  useEffect(() => {
    const t = setTimeout(() => setIsChecking(false), 500)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    if (isChecking || isLoading || subLoading) return
    if (!isConnected) {
      router.push('/salon/setup')
      return
    }
    if (!hasValidSubscription) {
      router.push('/payment/packages')
    }
  }, [isChecking, isLoading, subLoading, isConnected, hasValidSubscription, router])

  useEffect(() => {
    if (!salon || isLoading || isChecking || !hasValidSubscription) return

    const progress = salon.progress ?? 0
    const hasOpeningHours = salon.openingHours && Object.keys(salon.openingHours).length > 0

    if (progress <= 40) {
      setShowConfigModal(true)
      setShowLocationModal(false)
    } else if (progress >= 60 && progress < 80 && hasOpeningHours) {
      setShowConfigModal(false)
      setShowLocationModal(true)
    } else {
      setShowConfigModal(false)
      setShowLocationModal(false)
    }
  }, [salon, isLoading, isChecking, hasValidSubscription])

  const handleCloseConfigModal = () => {
    if ((salon?.progress ?? 0) > 40) setShowConfigModal(false)
  }

  const handleCloseLocationModal = () => {
    if ((salon?.progress ?? 0) >= 80) setShowLocationModal(false)
  }

  if (isChecking || isLoading || subLoading) {
    return <LoadingScreen message="Vérification de l'abonnement..." />
  }

  if (!isConnected || !hasValidSubscription) return null

  const isBlurred = showConfigModal || showLocationModal

  return (
    <>
      <div className={isBlurred ? 'filter blur-sm pointer-events-none' : ''}>
        {children}
      </div>

      {salon && (
        <SalonConfigModal
          isOpen={showConfigModal}
          onClose={handleCloseConfigModal}
          salon={salon}
        />
      )}

      {salon && (
        <SalonLocationForm
          isOpen={showLocationModal}
          onClose={handleCloseLocationModal}
          countryCode="cm"
        />
      )}
    </>
  )
}
