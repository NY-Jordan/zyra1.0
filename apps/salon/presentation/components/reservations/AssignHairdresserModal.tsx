'use client'

import React, { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@zyra/ui/components/dialog'
import { Button } from '@zyra/ui/components/button'
import { ScrollArea } from '@zyra/ui/components/scroll-area'
import { Loader2, AlertCircle } from 'lucide-react'
import { IHairDresser } from '@zyra/conf/domain/entities/hairdressers.entities'
import useSalon from '@/hooks/useSalon'
import { fetchCollection } from '@zyra/conf/lib/query'
import { where } from 'firebase/firestore'
import { useHairDressers } from '@/usecases/useHairDressers'

interface AssignHairdresserModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect: (hairdresser: IHairDresser) => Promise<void>
  loading?: boolean
}

export default function AssignHairdresserModal({
  open,
  onOpenChange,
  onSelect,
  loading = false,
}: AssignHairdresserModalProps) {
  const { salon } = useSalon()
  const [selectedHairdresserId, setSelectedHairdresserId] = useState<string | null>(null)
  const [isSelecting, setIsSelecting] = useState(false)

   const {
      hairDressers,
      isLoading
    } = useHairDressers()

  const selectedHairdresser = useMemo(() => {
    return hairDressers.find(h => h.id === selectedHairdresserId)
  }, [hairDressers, selectedHairdresserId]);


  const handleSelect = async () => {
    if (!selectedHairdresser) return
    try {
      setIsSelecting(true)
      await onSelect(selectedHairdresser)
      setSelectedHairdresserId(null)
      onOpenChange(false)
    } catch (error) {
      console.error('Erreur lors de la sélection:', error)
    } finally {
      setIsSelecting(false)
    }
  }

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setSelectedHairdresserId(null)
    }
    onOpenChange(newOpen)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md dark:bg-slate-900">
        <DialogHeader>
          <DialogTitle>Assigner un coiffeur</DialogTitle>
          <DialogDescription>
            Sélectionnez un coiffeur pour cette réservation
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-64 pr-4">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : hairDressers.length > 0 ? (
            <div className="space-y-2">
              {hairDressers.map(hairdresser => (
                <button
                  key={hairdresser.id}
                  onClick={() => setSelectedHairdresserId(hairdresser.id!)}
                  disabled={isSelecting || loading}
                  className={`w-full flex items-center gap-3 text-left p-3 rounded-md border-2 transition-colors ${
                    selectedHairdresserId === hairdresser.id
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-slate-600 hover:border-gray-300 dark:hover:border-slate-500'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {hairdresser.photo && (
                    <img
                      src={hairdresser.photo}
                      alt={hairdresser.name}
                      className="h-10 w-10 rounded-full object-cover flex-shrink-0"
                    />
                  )}
                  <div className="flex-1">
                    <p className="font-medium text-sm">
                      {hairdresser.name}
                    </p>
                    {hairdresser.speciality && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {hairdresser.speciality}
                      </p>
                    )}
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full gap-2">
              <AlertCircle className="h-5 w-5 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Aucun coiffeur disponible</p>
            </div>
          )}
        </ScrollArea>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={isSelecting || loading}
          >
            Annuler
          </Button>
          <Button
            onClick={handleSelect}
            disabled={!selectedHairdresserId || isSelecting || loading}
          >
            {isSelecting || loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Assignation...
              </>
            ) : (
              'Assigner'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
