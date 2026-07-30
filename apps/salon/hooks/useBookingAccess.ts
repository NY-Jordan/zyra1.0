'use client'
import { useQuery } from '@tanstack/react-query'
import { fetchCollection, fetchAllSubCollections } from '@zyra/conf/lib/query'
import { where } from 'firebase/firestore'
import { hairDresserAssociationNameEnum, hairDresserInvitationStatusEnum } from '@zyra/conf/domain/entities/hairdressers.entities'
import { useSalon } from '@zyra/core/hooks/useSalon'

export interface BookingAccessState {
  /** Étape 1 : au moins un service créé */
  hasServices: boolean
  /** Étape 2 : au moins une invitation envoyée (pending ou accepted) */
  hasInvitation: boolean
  /** Étape 3 : au moins un coiffeur a validé son invitation */
  hasValidatedHairdresser: boolean
  /** Tout est bon → sections déverrouillées */
  isReady: boolean
  isLoading: boolean
}

export function useBookingAccess(): BookingAccessState {
  const { salon, salonId, isLoading: salonLoading } = useSalon()

  const hasServices = (salon?.services?.length ?? 0) > 0

  // Étape 2 : invitation envoyée (pending ou accepted)
  const { data: invitationCount = 0, isLoading: invLoading } = useQuery({
    queryKey: ['booking-access-invitations', salonId],
    enabled: !!salonId,
    staleTime: 30_000,
    queryFn: async () => {
      const rows = await fetchCollection('hair_dresser_invitations', [
        where('salonId', '==', salonId),
      ])
      // compte seulement les invitations actives (pas rejected/expired)
      return rows.filter(
        (r: any) =>
          r.status === hairDresserInvitationStatusEnum.PENDING ||
          r.status === hairDresserInvitationStatusEnum.ACCEPTED
      ).length
    },
  })

  // Étape 3 : coiffeur validé (association créée)
  const { data: validatedCount = 0, isLoading: hdLoading } = useQuery({
    queryKey: ['booking-access-hairdressers', salonId],
    enabled: !!salonId,
    staleTime: 30_000,
    queryFn: async () => {
      const assocs = await fetchAllSubCollections(
        hairDresserAssociationNameEnum.SALON_HAIR_DRESSER,
        [where('salonId', '==', salonId)]
      )
      return assocs.length
    },
  })

  const hasInvitation = invitationCount > 0
  const hasValidatedHairdresser = validatedCount > 0
  const isLoading = salonLoading || invLoading || hdLoading
  const isReady = hasServices && hasValidatedHairdresser

  return { hasServices, hasInvitation, hasValidatedHairdresser, isReady, isLoading }
}
