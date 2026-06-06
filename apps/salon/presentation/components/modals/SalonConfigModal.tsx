'use client'
import React, { useState, useEffect } from 'react'
import { Button } from '@zyra/ui/components/button'
import { Input } from '@zyra/ui/components/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@zyra/ui/components/dialog'
import { Clock, AlertTriangle } from 'lucide-react'
import { useSalon } from '@/hooks/useSalon'
import { editDocument } from '@zyra/conf/lib/query'
import { toast } from 'sonner'
import { ISalon, OpeningHour } from '@zyra/conf/domain/entities/salons.entities'
import { defaultOpeningHours } from '../../../../../packages/conf/src/lib/config';

interface SalonConfigModalProps {
  isOpen: boolean
  onClose: () => void
  salon: ISalon
}

export default function SalonConfigModal({ isOpen, onClose, salon }: SalonConfigModalProps) {
  const [openingHours, setOpeningHours] = useState<OpeningHour[]>(defaultOpeningHours)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { refetch } = useSalon()

  useEffect(() => {
    if (salon?.openingHours && Array.isArray(salon.openingHours) && salon.openingHours.length > 0) {
      const extendedHours: OpeningHour[] = salon.openingHours.map(hour => ({
        ...hour,
        openDay: !!(hour.open && hour.close)
      }))
      setOpeningHours(extendedHours)
    } else {
      // Utiliser les horaires par défaut si le salon n'a pas encore d'horaires configurés
      setOpeningHours(defaultOpeningHours)
    }
  }, [salon])

  const handleHourChange = (index: number, field: 'open' | 'close', value: string) => {
    const newHours = [...openingHours]
    newHours[index] = { ...newHours[index], [field]: value }
    setOpeningHours(newHours)
  }

  const handleDayToggle = (index: number) => {
    const newHours = [...openingHours]
    newHours[index] = { ...newHours[index], openDay: !newHours[index].openDay }
    setOpeningHours(newHours)
  }

  const handleSubmit = async () => {
    if (!salon?.id) {
      toast.error('Erreur: ID du salon manquant')
      return
    }
    const hasValidHours = openingHours.some(hour => 
      hour.openDay && hour.open && hour.close && hour.open < hour.close
    )
    if (!hasValidHours) {
      toast.error('Veuillez configurer au moins un jour avec des horaires valides')
      return
    }
    setIsSubmitting(true)
    try {
      const standardOpeningHours: OpeningHour[] = openingHours
        .filter(hour => hour.openDay) 
        .map(hour => ({
          day: hour.day,
          open: hour.open,
          close: hour.close,
          openDay : hour.openDay
        }))

      await editDocument('salons', salon.id, {
        openingHours: standardOpeningHours,
        updatedAt: new Date(),
        progress : 60
      })
      toast.success('Horaires mis à jour avec succès!')
      const updatedSalon = await refetch()
      if (updatedSalon.data && updatedSalon.data.progress > 40) {
        onClose()
        toast.success("Configuration des heures d'ouverture terminée ! ")
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error)
      toast.error('Erreur lors de la sauvegarde des horaires')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={() => {}} modal>
      <DialogContent 
        className="max-w-7xl w-full max-h-[90vh] overflow-y-auto"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <AlertTriangle className="h-6 w-6 text-amber-500" />
            Configuration incomplète du salon
          </DialogTitle>
          <DialogDescription className="text-base">
            Votre salon n'est configuré qu'à {salon.progress}%. La configuration des horaires d'ouverture est 
            <strong className="text-red-600"> obligatoire</strong> pour continuer. Veuillez configurer vos horaires pour accéder à votre tableau de bord.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Barre de progression */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progression de la configuration</span>
              <span className="font-medium">{salon.progress}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-300 ${
                  salon.progress < 50 ? 'bg-red-500' : salon.progress < 80 ? 'bg-amber-500' : 'bg-green-500'
                }`}
                style={{ width: `${salon.progress}%` }}
              />
            </div>
          </div>

          {/* Configuration des horaires */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-600" />
              <h3 className="text-lg font-semibold">Horaires d'ouverture</h3>
            </div>

            <div className="grid gap-3">
              {openingHours.map((hour, index) => (
                <div
                  key={hour.day} 
                  className={`flex items-center gap-4 p-3 rounded-lg border ${
                    hour.openDay ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800' : 'bg-gray-50 dark:bg-slate-800 border-gray-200 dark:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={hour.openDay}
                      onChange={() => handleDayToggle(index)}
                      className="h-4 w-4 text-blue-600 rounded"
                    />
                    <span className="w-20 font-medium text-gray-700 dark:text-slate-300">
                      {hour.day}
                    </span>
                  </div>

                  {hour.openDay ? (
                    <div className="flex items-center gap-2">
                      <Input
                        type="time"
                        value={hour.open}
                        onChange={(e) => handleHourChange(index, 'open', e.target.value)}
                        className="w-[120px]"
                      />
                      <span className="text-gray-500 dark:text-slate-400">à</span>
                      <Input
                        type="time"
                        value={hour.close}
                        onChange={(e) => handleHourChange(index, 'close', e.target.value)}
                        className="w-[120px]"
                      />
                    </div>
                  ) : (
                    <span className="text-gray-500 dark:text-slate-400 italic">Fermé</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button 
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="min-w-[120px]"
            >
              {isSubmitting ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                  Sauvegarde...
                </>
              ) : (
                <>
                  <Clock className="mr-2 h-4 w-4" />
                  Configurer les horaires
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
