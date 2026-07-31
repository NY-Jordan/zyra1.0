'use client'

import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@zyra/ui/components/alert-dialog'
import { Input } from '@zyra/ui/components/input'
import { Button } from '@zyra/ui/components/button'
import { Badge } from '@zyra/ui/components/badge'
import { CheckCircle, AlertCircle, Loader } from 'lucide-react'
import { reservationStatusEnum } from '@zyra/conf/domain/enums/ReservationEnum'
import { fetchCollection } from '@zyra/conf/lib/query'
import { where } from 'firebase/firestore'
import { IReservation } from '@zyra/conf/domain/entities/reservations.entities'
import useSalon from '@zyra/core/hooks/useSalon'

interface ConfirmReservationModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function ConfirmReservationModal({
  open,
  onOpenChange,
}: ConfirmReservationModalProps) {
  const { salon } = useSalon()
  const [reservationNumber, setReservationNumber] = useState('')
  const [foundReservation, setFoundReservation] = useState<IReservation | null>(null)
  const [error, setError] = useState('')
  const [isConfirming, setIsConfirming] = useState(false)

  // Rechercher la réservation par numéro
  const { data: searchResults = [], isLoading: isSearching } = useQuery({
    queryKey: ['confirm-reservation-search', salon?.id, reservationNumber],
    queryFn: async () => {
      if (!salon?.id || reservationNumber.length !== 5) return []
      try {
        const results = await fetchCollection('reservations', [
          where('salonId', '==', salon.id),
          where('reservationNumber', '==', reservationNumber)
        ])
        return results as IReservation[]
      } catch (error) {
        console.error('Erreur lors de la recherche:', error)
        return []
      }
    },
    enabled: !!salon?.id && reservationNumber.length === 5
  })

  React.useEffect(() => {
    if (searchResults.length > 0) {
      setFoundReservation(searchResults[0])
      setError('')
    } else if (reservationNumber.length === 5 && !isSearching) {
      setFoundReservation(null)
      setError('Aucune réservation trouvée avec ce numéro')
    }
  }, [searchResults, reservationNumber, isSearching])

  const handleConfirm = async () => {
    if (!foundReservation) {
      setError('Veuillez d\'abord trouver une réservation')
      return
    }

    // Vérifier si la réservation est déjà confirmée
    if (foundReservation.status !== 'pending') {
      setError(`Cette réservation est déjà ${foundReservation.status}. La confirmation n'est pas nécessaire.`)
      return
    }

    try {
      setError('')
      setIsConfirming(true)
      // TODO: Intégrer l'appel API pour confirmer la réservation
      console.log('Confirmation réservation:', foundReservation.id)
      // Exemple: await updateReservationStatus(foundReservation.id, 'confirmed')
      setIsConfirming(false)
      handleClose()
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la confirmation')
      setIsConfirming(false)
    }
  }

  const handleClose = () => {
    setReservationNumber('')
    setFoundReservation(null)
    setError('')
    onOpenChange(false)
  }

  return (
    <AlertDialog open={open} onOpenChange={handleClose}>
      <AlertDialogContent className="max-w-md dark:bg-slate-900">
        <AlertDialogHeader className="pb-4">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <AlertDialogTitle>Confirmer une réservation</AlertDialogTitle>
          </div>
        </AlertDialogHeader>

        <div className="space-y-4 py-4">
          {/* Recherche par numéro */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Numéro de réservation</label>
            <div className="flex gap-2">
              <Input
                placeholder="Entrez le numéro (5 chiffres)"
                value={reservationNumber}
                onChange={(e) => {
                  const value = e.target.value.slice(0, 5)
                  setReservationNumber(value)
                  setError('')
                }}
                maxLength={5}
                type="text"
                disabled={isSearching || isConfirming}
              />
              {isSearching && reservationNumber.length === 5 && (
                <div className="flex items-center justify-center">
                  <Loader className="h-4 w-4 animate-spin" />
                </div>
              )}
            </div>
          </div>

          {/* Résultat de la recherche */}
          {foundReservation && (
            <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800 space-y-2">
              <p className="text-sm font-medium text-green-900 dark:text-green-300">Réservation trouvée</p>
              <div className="text-sm space-y-1 text-gray-700 dark:text-slate-300">
                <p><span className="font-medium">Client:</span> {foundReservation.clientName}</p>
                <p><span className="font-medium">Téléphone:</span> {foundReservation.clientPhone}</p>
                <p><span className="font-medium">Montant:</span> {foundReservation.totalPrice.toLocaleString()} XAF</p>
                {foundReservation.people?.[0] && (
                  <>
                    <p>
                      <span className="font-medium">Date:</span> {' '}
                      <span className="font-bold">
                        {new Date(foundReservation.people[0].scheduledAt.toDate()).toLocaleDateString('fr-FR', {
                          day: '2-digit',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </span>
                    </p>
                    <p>
                      <span className="font-medium">Heure:</span> {' '}
                      <span className="font-bold">
                        {new Date(foundReservation.people[0].scheduledAt.toDate()).toLocaleTimeString('fr-FR', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </p>
                  </>
                )}
                <div className="flex items-center gap-2 pt-1">
                  <span className="font-medium">Statut:</span>
                  <Badge variant={foundReservation.status === reservationStatusEnum.pending ? 'secondary' : 'default'}>
                    {foundReservation.status}
                  </Badge>
                </div>
              </div>
            </div>
          )}

          {/* Messages d'erreur */}
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800 flex gap-2 items-start">
              <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}
        </div>

        <div className="flex gap-3 justify-end pt-4 border-t dark:border-slate-700">
          <AlertDialogCancel disabled={isConfirming || isSearching}>Annuler</AlertDialogCancel>
          <Button
            onClick={handleConfirm}
            disabled={isConfirming || !foundReservation}
            className="bg-green-600 hover:bg-green-700"
          >
            {isConfirming ? 'Confirmation...' : 'Confirmer'}
          </Button>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  )
}
