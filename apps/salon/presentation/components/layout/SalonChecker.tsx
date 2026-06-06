'use client'
import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSalon } from '@/hooks/useSalon'
import LoadingScreen from '@/presentation/components/common/LoadingScreen'
import SalonConfigModal from '@/presentation/components/modals/SalonConfigModal'
import SalonLocationForm from '@/presentation/components/SalonLocationForm'
import { useOwner } from '@/hooks/useOwner'
import { SalonStatusEnum } from '@zyra/conf/domain/enums/statusEnum'
import { ownerAuthService } from '@/services/ownerAuthService'

interface SalonCheckerProps {
  children: React.ReactNode
}

export default function SalonChecker({ children }: SalonCheckerProps) {
  const { isConnected, salon, isLoading } = useSalon()
  const { isAuthenticated, owner, refetch, isLoading : ownerIsLoading } = useOwner()
  const router = useRouter()
  const [isChecking, setIsChecking] = useState(true)
  const [showConfigModal, setShowConfigModal] = useState(false)
  const [showLocationModal, setShowLocationModal] = useState(false)

  useEffect(() => {
    // Petit délai pour permettre au hook de se charger
    const timer = setTimeout(() => {
      setIsChecking(false)
    }, 500)

    return () => clearTimeout(timer)
  }, [])

  useEffect( () => {
     if (!isChecking && !ownerIsLoading) {
      if (owner?.status.name === SalonStatusEnum.payment) {
        router.push('/payment/packages');
        return;
      }
      if (owner?.status.name === SalonStatusEnum.active) {
        if(!isConnected) {
          router.push('/salon/setup')
          return;
        }
      }
    }
  }, [isConnected, isChecking, router, owner])

  useEffect(() => {
    if (salon && !isLoading && !isChecking) {
      const progress = salon.progress ?? 0
      const hasOpeningHours = salon.openingHours && Object.keys(salon.openingHours).length > 0
      if (progress <= 40) {
        // Moins de 40% : afficher le modal de configuration
        setShowConfigModal(true)
        setShowLocationModal(false)
      } else if (progress >= 60 && progress < 80 && hasOpeningHours) {
        // Entre 60% et 80% avec horaires configurés : afficher le modal de localisation
        setShowConfigModal(false)
        setShowLocationModal(true)
      } else {
        // 80% ou plus : afficher les children normalement
        setShowConfigModal(false)
        setShowLocationModal(false)
      }
    }
  }, [salon, isLoading, isChecking])

  const handleCloseConfigModal = () => {
    const progress = salon?.progress ?? 0
    if (progress > 40) {
      setShowConfigModal(false)
    }
  }



  const handleCloseLocationModal = () => {
    const progress = salon?.progress ?? 0
    if (progress >= 80) {
      setShowLocationModal(false)
    }
  }

  if (isChecking || isLoading) {
    return <LoadingScreen message="Vérification du salon..." />
  }

  // Vérifier si on peut afficher les children (80% ou plus)
  const isBlurred = showConfigModal || showLocationModal

  return (
    <>
        <div className={isBlurred ? 'filter blur-sm pointer-events-none' : ''}>
          {children}
        </div>

      {/* Modal de configuration du salon (≤ 40%) */}
      {salon && (
        <SalonConfigModal
          isOpen={showConfigModal}
          onClose={handleCloseConfigModal}
          salon={salon}
        />
      )}

      {/* Modal de localisation (60% ≤ progress < 80% avec horaires) */}
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
