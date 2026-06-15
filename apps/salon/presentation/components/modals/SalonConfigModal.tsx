'use client'
import React, { useState, useEffect } from 'react'
import { Input } from '@zyra/ui/components/input'
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@zyra/ui/components/dialog'
import { Clock, Sparkles } from 'lucide-react'
import { useSalon } from '@/hooks/useSalon'
import { editDocument } from '@zyra/conf/lib/query'
import { toast } from 'sonner'
import { ISalon, OpeningHour } from '@zyra/conf/domain/entities/salons.entities'
import { defaultOpeningHours } from '../../../../../packages/conf/src/lib/config'

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
      setOpeningHours(salon.openingHours.map(h => ({ ...h, openDay: !!(h.open && h.close) })))
    } else {
      setOpeningHours(defaultOpeningHours)
    }
  }, [salon])

  const handleHourChange = (index: number, field: 'open' | 'close', value: string) => {
    const next = [...openingHours]
    next[index] = { ...next[index], [field]: value }
    setOpeningHours(next)
  }

  const handleDayToggle = (index: number) => {
    const next = [...openingHours]
    next[index] = { ...next[index], openDay: !next[index].openDay }
    setOpeningHours(next)
  }

  const handleSubmit = async () => {
    if (!salon?.id) return
    const hasValidHours = openingHours.some(h => h.openDay && h.open && h.close && h.open < h.close)
    if (!hasValidHours) {
      toast.error('Veuillez configurer au moins un jour avec des horaires valides')
      return
    }
    setIsSubmitting(true)
    try {
      await editDocument('salons', salon.id, {
        openingHours: openingHours
          .filter(h => h.openDay)
          .map(h => ({ day: h.day, open: h.open, close: h.close, openDay: h.openDay })),
        updatedAt: new Date(),
        progress: 60,
      })
      const updated = await refetch()
      if (updated.data && updated.data.progress > 40) onClose()
      toast.success('Horaires enregistrés avec succès !')
    } catch {
      toast.error('Erreur lors de la sauvegarde des horaires')
    } finally {
      setIsSubmitting(false)
    }
  }

  const openDaysCount = openingHours.filter(h => h.openDay).length

  return (
    <Dialog open={isOpen} onOpenChange={() => {}} modal>
      <DialogContent
        className="max-w-2xl w-full max-h-[90vh] overflow-y-auto p-0"
        onPointerDownOutside={e => e.preventDefault()}
        onEscapeKeyDown={e => e.preventDefault()}
      >
        <DialogTitle className="sr-only">Horaires d'ouverture</DialogTitle>

        {/* Header */}
        <div className="px-8 pt-8 pb-6 border-b border-[#F0EAE4] dark:border-slate-800">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/20 flex-shrink-0">
              <Clock className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-[20px] font-extrabold text-slate-800 dark:text-white leading-tight">
                Quand accueillez-vous vos clients ?
              </h2>
              <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5">
                Définissez vos jours et heures d'ouverture — modifiables à tout moment.
              </p>
            </div>
          </div>

          {/* Progress */}
          <div className="bg-[#F8F4F0] dark:bg-slate-800/60 rounded-xl px-4 py-3 flex items-center gap-3">
            <Sparkles className="w-4 h-4 text-emerald-500 flex-shrink-0" />
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[12px] font-semibold text-slate-600 dark:text-slate-300">
                  Configuration du salon
                </span>
                <span className="text-[12px] font-bold text-emerald-600 dark:text-emerald-400">
                  {salon.progress}%
                </span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5">
                <div
                  className="h-1.5 rounded-full bg-emerald-500 transition-all duration-500"
                  style={{ width: `${salon.progress}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Days grid */}
        <div className="px-8 py-6 space-y-2">
          <div className="flex items-center justify-between mb-4">
            <p className="text-[13px] font-semibold text-slate-700 dark:text-slate-300">
              Activez les jours où vous êtes ouvert
            </p>
            <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-2.5 py-1 rounded-full">
              {openDaysCount} jour{openDaysCount !== 1 ? 's' : ''} sélectionné{openDaysCount !== 1 ? 's' : ''}
            </span>
          </div>

          {openingHours.map((hour, index) => (
            <div
              key={hour.day}
              className={`flex items-center gap-4 px-4 py-3 rounded-xl border transition-all duration-200 ${
                hour.openDay
                  ? 'bg-emerald-50/60 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-800/50'
                  : 'bg-[#FAFAF9] dark:bg-slate-800/40 border-[#EDE8E3] dark:border-slate-700/50'
              }`}
            >
              {/* Toggle */}
              <button
                type="button"
                onClick={() => handleDayToggle(index)}
                className={`relative flex-shrink-0 w-9 h-5 rounded-full transition-colors duration-200 focus:outline-none ${
                  hour.openDay ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-700'
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${
                    hour.openDay ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>

              {/* Day label */}
              <span className={`w-24 text-[13px] font-semibold transition-colors ${
                hour.openDay ? 'text-slate-800 dark:text-white' : 'text-slate-400 dark:text-slate-500'
              }`}>
                {hour.day}
              </span>

              {/* Time inputs */}
              {hour.openDay ? (
                <div className="flex items-center gap-2 flex-1">
                  <Input
                    type="time"
                    value={hour.open}
                    onChange={e => handleHourChange(index, 'open', e.target.value)}
                    className="w-[110px] h-8 text-[13px] text-center dark:bg-slate-800"
                  />
                  <span className="text-[12px] text-slate-400 font-medium">—</span>
                  <Input
                    type="time"
                    value={hour.close}
                    onChange={e => handleHourChange(index, 'close', e.target.value)}
                    className="w-[110px] h-8 text-[13px] text-center dark:bg-slate-800"
                  />
                </div>
              ) : (
                <span className="text-[12px] text-slate-400 dark:text-slate-500 italic flex-1">
                  Fermé ce jour
                </span>
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-8 pb-8">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2 h-12 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-60 text-white font-semibold text-[14px] rounded-xl transition-all shadow-lg shadow-emerald-500/20"
          >
            {isSubmitting ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Clock className="w-4 h-4" />
                Enregistrer mes horaires
              </>
            )}
          </button>
          <p className="text-center text-[11px] text-slate-400 dark:text-slate-500 mt-3">
            Ces horaires seront visibles par vos clients sur votre profil Zyra.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
