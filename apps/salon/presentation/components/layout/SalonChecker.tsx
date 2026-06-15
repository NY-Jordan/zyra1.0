'use client'
import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSalon } from '@/hooks/useSalon'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { fetchCollection, editDocument, getDocument } from '@zyra/conf/lib/query'
import { where } from 'firebase/firestore'
import { ISubscription, SubscriptionStatus } from '@zyra/conf/domain/entities/subscriptions.entities'
import { ISalon } from '@zyra/conf/domain/entities/salons.entities'
import LoadingScreen from '@/presentation/components/common/LoadingScreen'
import SalonConfigModal from '@/presentation/components/modals/SalonConfigModal'
import SalonLocationForm from '@/presentation/components/SalonLocationForm'
import WelcomeModal from '@/presentation/components/onboarding/WelcomeModal'
import OnboardingTransitionModal from '@/presentation/components/onboarding/OnboardingTransitionModal'
import OnboardingBanner from '@/presentation/components/onboarding/OnboardingBanner'
import { signOut } from 'firebase/auth'
import { auth } from '@zyra/conf/lib/firebase'
import { toast } from 'sonner'

const SESSION_DURATION = 2 * 60 * 60 * 1000

interface SalonCheckerProps {
  children: React.ReactNode
}

export default function SalonChecker({ children }: SalonCheckerProps) {
  const { isConnected, salon, salonId, isLoading } = useSalon()
  const router = useRouter()
  const queryClient = useQueryClient()
  const [isChecking, setIsChecking] = useState(true)

  // Config modal states
  const [showConfigModal, setShowConfigModal] = useState(false)
  const [showLocationModal, setShowLocationModal] = useState(false)

  // Onboarding transition modal states
  const [showWelcome, setShowWelcome] = useState(false)
  const [showConfigComplete, setShowConfigComplete] = useState(false)
  const [showServicesComplete, setShowServicesComplete] = useState(false)
  const [showOnboardingDone, setShowOnboardingDone] = useState(false)
  const [transitionLoading, setTransitionLoading] = useState(false)

  // ── Subscription check ─────────────────────────────────────────────────────

  const { data: subscription, isLoading: subLoading } = useQuery({
    queryKey: ['salon-subscription-check', salonId],
    enabled: !!salonId,
    staleTime: 60_000,
    queryFn: async () => {
      const subs = await fetchCollection('subscriptions', [where('userId', '==', salonId)])
      if (!subs.length) return null
      const active = subs.find((s: any) => s.status === SubscriptionStatus.ACTIVE)
      if (active) return active as ISubscription
      return [...subs].sort(
        (a: any, b: any) => (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0)
      )[0] as ISubscription
    },
  })

  const hasValidSubscription = (() => {
    if (!subscription) return false
    if (subscription.status !== SubscriptionStatus.ACTIVE) return false
    if (subscription.endDate) {
      return new Date((subscription.endDate as any).seconds * 1000) > new Date()
    }
    return true
  })()

  // ── Poll salon data during active onboarding steps ─────────────────────────

  const onboardingStep = salon?.onboardingStep
  const monitoringActive = onboardingStep === 'services' || onboardingStep === 'hairdressers'

  useQuery({
    queryKey: ['salon', salonId],
    enabled: !!salonId && monitoringActive,
    refetchInterval: 4_000,
    queryFn: () => getDocument('salons', salonId!) as Promise<ISalon>,
  })

  // ── Hairdresser invitations count (for hairdressers step) ─────────────────

  const { data: invitationCount } = useQuery({
    queryKey: ['onboarding-invitations', salonId],
    enabled: !!salonId && onboardingStep === 'hairdressers',
    refetchInterval: 4_000,
    queryFn: async () => {
      const invitations = await fetchCollection('hair_dresser_invitations', [
        where('salonId', '==', salonId),
      ])
      return invitations.length
    },
  })

  // ── Session expiry ─────────────────────────────────────────────────────────

  useEffect(() => {
    const loginTime = sessionStorage.getItem('salonLoginTime')
    if (!loginTime) return
    const elapsed = Date.now() - parseInt(loginTime)
    if (elapsed >= SESSION_DURATION) {
      signOut(auth); sessionStorage.clear(); router.push('/auth/login'); return
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

  // ── Auth + subscription guards ─────────────────────────────────────────────

  useEffect(() => {
    if (isChecking || isLoading || subLoading) return
    if (!isConnected) { router.push('/salon/setup'); return }
    if (!hasValidSubscription) router.push('/payment/packages')
  }, [isChecking, isLoading, subLoading, isConnected, hasValidSubscription, router])

  // ── Onboarding: welcome ────────────────────────────────────────────────────

  useEffect(() => {
    if (!salon || isLoading || !hasValidSubscription) return
    if (salon.onboardingStep === 'welcome') setShowWelcome(true)
  }, [salon?.onboardingStep, isLoading, hasValidSubscription])

  // ── Onboarding: config modals (step 'config' or legacy undefined) ──────────

  useEffect(() => {
    const step = salon?.onboardingStep
    if (step && step !== 'config') return
    if (!salon || isLoading || isChecking || !hasValidSubscription) return

    const progress = salon.progress ?? 0
    const hasOpeningHours = salon.openingHours && Object.keys(salon.openingHours).length > 0

    if (progress <= 40) {
      setShowConfigModal(true); setShowLocationModal(false)
    } else if (progress >= 60 && progress < 80 && hasOpeningHours) {
      setShowConfigModal(false); setShowLocationModal(true)
    } else {
      setShowConfigModal(false); setShowLocationModal(false)
    }
  }, [salon, isLoading, isChecking, hasValidSubscription])

  // ── Onboarding: config complete → services ─────────────────────────────────

  useEffect(() => {
    if (salon?.onboardingStep !== 'config') return
    if ((salon?.progress ?? 0) >= 80 && !showConfigComplete) setShowConfigComplete(true)
  }, [salon?.onboardingStep, salon?.progress])

  // ── Onboarding: services complete → hairdressers ──────────────────────────

  useEffect(() => {
    if (salon?.onboardingStep !== 'services') return
    if ((salon?.services?.length ?? 0) > 0 && !showServicesComplete) setShowServicesComplete(true)
  }, [salon?.onboardingStep, salon?.services?.length])

  // ── Onboarding: hairdressers complete → done ───────────────────────────────

  useEffect(() => {
    if (salon?.onboardingStep !== 'hairdressers') return
    if ((invitationCount ?? 0) > 0 && !showOnboardingDone) setShowOnboardingDone(true)
  }, [salon?.onboardingStep, invitationCount])

  // ── Handlers ───────────────────────────────────────────────────────────────

  const updateStep = async (step: string) => {
    await editDocument('salons', salonId!, { onboardingStep: step })
    queryClient.invalidateQueries({ queryKey: ['salon', salonId] })
  }

  const handleWelcomeContinue = async () => {
    setTransitionLoading(true)
    await updateStep('config')
    setShowWelcome(false)
    setTransitionLoading(false)
  }

  const handleConfigCompleteContinue = async () => {
    setTransitionLoading(true)
    setShowConfigComplete(false)
    setShowConfigModal(false)
    setShowLocationModal(false)
    await updateStep('services')
    setTransitionLoading(false)
    router.push('/salon/services')
  }

  const handleServicesCompleteContinue = async () => {
    setTransitionLoading(true)
    setShowServicesComplete(false)
    await updateStep('hairdressers')
    setTransitionLoading(false)
    router.push('/salon/hair-dressers')
  }

  const handleOnboardingDone = async () => {
    setTransitionLoading(true)
    setShowOnboardingDone(false)
    await updateStep('done')
    setTransitionLoading(false)
    router.push('/salon/dashboard')
  }

  const handleCloseConfigModal = () => {
    if ((salon?.progress ?? 0) > 40) setShowConfigModal(false)
  }
  const handleCloseLocationModal = () => {
    if ((salon?.progress ?? 0) >= 80) setShowLocationModal(false)
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  if (isChecking || isLoading || subLoading) {
    return <LoadingScreen message="Vérification de l'abonnement..." />
  }

  if (!isConnected || !hasValidSubscription) return null

  const blockingModal = showWelcome || showConfigComplete || showServicesComplete || showOnboardingDone
  const isBlurred = blockingModal || showConfigModal || showLocationModal

  return (
    <>
      {/* Onboarding banner (non-blocking, shown above content) */}
      {(onboardingStep === 'services' || onboardingStep === 'hairdressers') && (
        <OnboardingBanner step={onboardingStep as 'services' | 'hairdressers'} />
      )}

      {/* Main content */}
      <div className={isBlurred ? 'filter blur-sm pointer-events-none select-none' : ''}>
        {children}
      </div>

      {/* Welcome modal */}
      <WelcomeModal
        open={showWelcome}
        salonName={salon?.name}
        onContinue={handleWelcomeContinue}
        isLoading={transitionLoading}
      />

      {/* Config modals (only when step is 'config' or legacy) */}
      {!blockingModal && salon && (
        <SalonConfigModal
          isOpen={showConfigModal}
          onClose={handleCloseConfigModal}
          salon={salon}
        />
      )}
      {!blockingModal && salon && (
        <SalonLocationForm
          isOpen={showLocationModal}
          onClose={handleCloseLocationModal}
          countryCode="cm"
        />
      )}

      {/* Transition modals */}
      <OnboardingTransitionModal
        open={showConfigComplete}
        variant="config"
        onCta={handleConfigCompleteContinue}
        isLoading={transitionLoading}
      />
      <OnboardingTransitionModal
        open={showServicesComplete}
        variant="services"
        onCta={handleServicesCompleteContinue}
        isLoading={transitionLoading}
      />
      <OnboardingTransitionModal
        open={showOnboardingDone}
        variant="done"
        onCta={handleOnboardingDone}
        isLoading={transitionLoading}
      />
    </>
  )
}
