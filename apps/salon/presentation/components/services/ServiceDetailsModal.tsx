'use client'

import React from 'react'
import { Dialog, DialogContent, DialogTitle } from '@zyra/ui/components/dialog'
import { Clock, DollarSign, Tag, Scissors, Star, Plus, X } from 'lucide-react'
import { formatPrice } from '@zyra/conf/lib/utils'
import { ISalonService, IServiceCategory, ISalonServiceSupplement } from '@zyra/conf/domain/entities/salons.entities'

interface ServiceDetailsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  service: ISalonService | null
  categories: IServiceCategory[]
}

function InfoStat({ icon, label, value, iconColor }: { icon: React.ReactNode; label: string; value: React.ReactNode; iconColor: string }) {
  return (
    <div className="bg-[#F8F4F0] dark:bg-slate-800/40 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-1.5">
        <div className={`w-7 h-7 rounded-lg bg-white/70 dark:bg-black/20 flex items-center justify-center flex-shrink-0 ${iconColor}`}>
          {icon}
        </div>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold">{label}</p>
      </div>
      <p className="text-[20px] font-extrabold text-slate-800 dark:text-white leading-none">{value}</p>
    </div>
  )
}

export default function ServiceDetailsModal({
  open,
  onOpenChange,
  service,
  categories
}: ServiceDetailsModalProps) {
  if (!service) return null

  const formatDuration = (minutes: number) => {
    if (!minutes) return '0min'
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours > 0) {
      return `${hours}h${mins > 0 ? mins.toString().padStart(2, '0') : ''}`
    }
    return `${mins}min`
  }

  const getCategoryName = (categoryId: string) => {
    const category = categories.find(cat => cat.id === categoryId)
    return category?.name || 'Non catégorisé'
  }

  const calculateSupplementsTotal = (supplements: ISalonServiceSupplement[]) => {
    if (!supplements || supplements.length === 0) {
      return { totalPrice: 0, totalDuration: 0 }
    }
    
    return supplements.reduce(
      (acc, supplement) => ({
        totalPrice: acc.totalPrice + (supplement.price || 0),
        totalDuration: acc.totalDuration + (supplement.duration || 0)
      }),
      { totalPrice: 0, totalDuration: 0 }
    )
  }

  const supplementsTotal = calculateSupplementsTotal(service.supplements || [])
  const grandTotal = {
    price: service.price + supplementsTotal.totalPrice,
    duration: service.duration + supplementsTotal.totalDuration
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="max-w-2xl p-0 overflow-hidden bg-white dark:bg-[#161B24] border border-[#F0EAE4] dark:border-slate-800/50 rounded-2xl gap-0 max-h-[88vh]"
      >
        <DialogTitle className="sr-only">Détails du service</DialogTitle>

        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-[#F0EAE4] dark:border-slate-800/50">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3 min-w-0">
              {service.imageUrl ? (
                <img
                  src={service.imageUrl}
                  alt={service.name}
                  className="w-10 h-10 rounded-2xl object-cover shadow-lg shadow-emerald-500/20 flex-shrink-0"
                />
              ) : (
                <div className="w-10 h-10 rounded-2xl bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/20 flex-shrink-0">
                  <Scissors className="w-5 h-5 text-white" />
                </div>
              )}
              <div className="min-w-0">
                <h2 className="text-[16px] font-extrabold text-slate-800 dark:text-white leading-tight truncate">
                  {service.name}
                </h2>
                <div className="flex items-center gap-2 mt-1">
                  <span
                    className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      service.isActive !== false
                        ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/50'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-current" />
                    {service.isActive !== false ? "Actif" : "Inactif"}
                  </span>
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border bg-[#F5F2EF] dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-[#EDE8E3] dark:border-slate-700">
                    <Tag className="h-3 w-3" />
                    {getCategoryName(service.categoryId)}
                  </span>
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="w-7 h-7 rounded-full bg-[#F5F2EF] dark:bg-slate-700 flex items-center justify-center text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors flex-shrink-0"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-5 overflow-y-auto">

          {/* Informations de base */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <InfoStat
              icon={<DollarSign className="h-3.5 w-3.5" />}
              label="Prix de base"
              value={formatPrice(service.price, 'XAF')}
              iconColor="text-emerald-600"
            />
            <InfoStat
              icon={<Clock className="h-3.5 w-3.5" />}
              label="Durée de base"
              value={formatDuration(service.duration)}
              iconColor="text-sky-600"
            />
          </div>

          {/* Suppléments */}
          {service.supplements && service.supplements.length > 0 && (
            <div className="space-y-3 pt-1 border-t border-[#F0EAE4] dark:border-slate-800/50">
              <h3 className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide pt-3">
                Suppléments disponibles ({service.supplements.length})
              </h3>

              <div className="space-y-2">
                {service.supplements.map((supplement, index) => (
                  <div
                    key={`${supplement.id}-${index}`}
                    className="flex items-center justify-between px-3 py-2.5 bg-[#F8F4F0] dark:bg-slate-800/40 rounded-xl"
                  >
                    <h4 className="text-[13px] font-semibold text-slate-700 dark:text-slate-300 truncate">{supplement.name}</h4>
                    <div className="flex items-center gap-3 text-[12px] flex-shrink-0">
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">
                        +{formatPrice(supplement.price, 'XAF')}
                      </span>
                      <span className="font-semibold text-slate-500 dark:text-slate-400">
                        +{formatDuration(supplement.duration)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Total des suppléments */}
              <div className="flex items-center justify-between px-3 py-2.5 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/50 rounded-xl">
                <h4 className="text-[12px] font-bold text-amber-800 dark:text-amber-300">Total suppléments</h4>
                <div className="flex items-center gap-3 text-[12px]">
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">
                    +{formatPrice(supplementsTotal.totalPrice, 'XAF')}
                  </span>
                  <span className="font-semibold text-amber-700 dark:text-amber-400">
                    +{formatDuration(supplementsTotal.totalDuration)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Prix total */}
          <div className="pt-1 border-t border-[#F0EAE4] dark:border-slate-800/50">
            <h3 className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide pt-3 mb-3 flex items-center gap-1.5">
              <Star className="h-3.5 w-3.5 text-amber-500" />
              Prix total du service
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="text-center bg-[#F8F4F0] dark:bg-slate-800/40 rounded-xl p-4">
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mb-1">Prix total</p>
                <p className="text-[22px] font-extrabold text-emerald-600 dark:text-emerald-400">
                  {formatPrice(grandTotal.price, 'XAF')}
                </p>
                {service.supplements && service.supplements.length > 0 && (
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">
                    Base: {formatPrice(service.price, 'XAF')} + Suppléments: {formatPrice(supplementsTotal.totalPrice, 'XAF')}
                  </p>
                )}
              </div>
              <div className="text-center bg-[#F8F4F0] dark:bg-slate-800/40 rounded-xl p-4">
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mb-1">Durée totale</p>
                <p className="text-[22px] font-extrabold text-sky-600 dark:text-sky-400">
                  {formatDuration(grandTotal.duration)}
                </p>
                {service.supplements && service.supplements.length > 0 && (
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">
                    Base: {formatDuration(service.duration)} + Suppléments: {formatDuration(supplementsTotal.totalDuration)}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Message si pas de suppléments */}
          {(!service.supplements || service.supplements.length === 0) && (
            <div className="text-center py-8 border-t border-[#F0EAE4] dark:border-slate-800/50">
              <Plus className="h-10 w-10 mx-auto text-slate-300 dark:text-slate-600 mb-3" />
              <p className="text-[13px] text-slate-400">Aucun supplément configuré pour ce service</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end px-6 py-4 border-t border-[#F0EAE4] dark:border-slate-800/50 bg-[#FAF7F4] dark:bg-slate-800/30">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="h-9 px-5 rounded-xl text-[12px] font-bold text-white bg-emerald-500 hover:bg-emerald-600 transition-colors"
          >
            Fermer
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}