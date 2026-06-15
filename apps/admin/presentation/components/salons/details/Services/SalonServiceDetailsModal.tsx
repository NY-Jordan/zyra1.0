'use client'
import { Dialog, DialogContent, DialogClose, DialogTitle } from '@zyra/ui/components/dialog'
import { ISalonService } from '@zyra/conf/domain/entities/salons.entities'
import { X, Clock, Banknote, Plus } from 'lucide-react'

function fmtDuration(min: number) {
  if (min < 60) return `${min} min`
  const h = Math.floor(min / 60)
  const m = min % 60
  return m ? `${h}h ${m}min` : `${h}h`
}

function fmtPrice(price: number) {
  return price.toLocaleString('fr-FR') + ' FCFA'
}

export default function SalonServiceDetailsModal({
  open, onClose, service, categoryLabel,
}: {
  open: boolean
  onClose: () => void
  service: ISalonService
  categoryLabel?: string
}) {
  if (!service) return null

  const supplements = service.supplements || []
  const suppPrice = supplements.reduce((a: number, s: any) => a + (Number(s.price) || 0), 0)
  const suppDuration = supplements.reduce((a: number, s: any) => a + (Number(s.duration) || 0), 0)
  const totalPrice = (Number(service.price) || 0) + suppPrice
  const totalDuration = (Number(service.duration) || 0) + suppDuration

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-md p-0 overflow-hidden dark:bg-[#161B24] border border-[#F0EAE4] dark:border-slate-800/50 rounded-2xl gap-0">

        {/* Header */}
        <DialogTitle className="sr-only">Détails du service</DialogTitle>
        <div className="relative bg-gradient-to-br from-[#FEF1EC] to-[#FAF7F4] dark:from-rose-950/20 dark:to-[#161B24] px-5 pt-5 pb-4">
          <DialogClose className="absolute top-3.5 right-3.5 w-7 h-7 rounded-full bg-white/80 dark:bg-slate-700/80 flex items-center justify-center text-slate-500 hover:text-slate-700 transition-colors">
            <X className="w-3.5 h-3.5" />
          </DialogClose>

          <div className="flex items-center gap-3.5 pr-8">
            {service.imageUrl ? (
              <img src={service.imageUrl} alt={service.name}
                className="w-14 h-14 rounded-xl object-cover border-2 border-white shadow-sm flex-shrink-0"
              />
            ) : (
              <div className="w-14 h-14 rounded-xl bg-rose-400 flex items-center justify-center flex-shrink-0">
                <Banknote className="w-6 h-6 text-white" />
              </div>
            )}
            <div>
              <h2 className="text-[16px] font-extrabold text-slate-800 dark:text-white leading-tight">{service.name}</h2>
              <div className="flex items-center gap-1.5 mt-1">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                  service.isActive !== false
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/50'
                    : 'bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800/50'
                }`}>
                  {service.isActive !== false ? 'Actif' : 'Inactif'}
                </span>
                {categoryLabel && (
                  <span className="text-[10px] font-semibold text-slate-500 bg-white/60 dark:bg-slate-700/50 px-2 py-0.5 rounded-full">
                    {categoryLabel}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Base price + duration */}
          <div className="flex gap-2 mt-4">
            <div className="flex-1 bg-white/70 dark:bg-slate-800/50 rounded-xl p-3 flex items-center gap-2">
              <Banknote className="w-4 h-4 text-rose-500 flex-shrink-0" />
              <div>
                <p className="text-[10px] text-slate-400 font-medium">Prix de base</p>
                <p className="text-[14px] font-bold text-slate-800 dark:text-white">{fmtPrice(Number(service.price) || 0)}</p>
              </div>
            </div>
            <div className="flex-1 bg-white/70 dark:bg-slate-800/50 rounded-xl p-3 flex items-center gap-2">
              <Clock className="w-4 h-4 text-sky-500 flex-shrink-0" />
              <div>
                <p className="text-[10px] text-slate-400 font-medium">Durée de base</p>
                <p className="text-[14px] font-bold text-slate-800 dark:text-white">{fmtDuration(Number(service.duration) || 0)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="px-5 py-4 space-y-4">

          {/* Supplements */}
          {supplements.length > 0 ? (
            <div>
              <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide mb-2.5">
                Suppléments · {supplements.length}
              </p>
              <div className="space-y-1.5">
                {supplements.map((sup: any, i: number) => (
                  <div key={i} className="flex items-center justify-between px-3 py-2 bg-[#FAF7F4] dark:bg-slate-800/40 rounded-xl">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-rose-400 flex-shrink-0" />
                      <span className="text-[13px] font-medium text-slate-700 dark:text-slate-300">{sup.name}</span>
                    </div>
                    <div className="flex items-center gap-3 text-[12px] text-slate-500 dark:text-slate-400">
                      {sup.duration ? (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {fmtDuration(Number(sup.duration))}
                        </span>
                      ) : null}
                      {sup.price ? (
                        <span className="font-semibold text-rose-500">+{fmtPrice(Number(sup.price))}</span>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-[12px] text-slate-400 dark:text-slate-500 italic text-center py-2">
              Aucun supplément pour ce service
            </p>
          )}

          {/* Total */}
          <div className="border-t border-[#F0EAE4] dark:border-slate-800/50 pt-4">
            <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide mb-2.5">Total</p>
            <div className="flex gap-2">
              <div className="flex-1 bg-[#EEF8F0] dark:bg-emerald-950/20 rounded-xl p-3 text-center">
                <p className="text-[10px] text-slate-500 font-medium">Prix total</p>
                <p className="text-[16px] font-extrabold text-emerald-700 dark:text-emerald-400 mt-0.5">
                  {fmtPrice(totalPrice)}
                </p>
              </div>
              <div className="flex-1 bg-[#ECF6FE] dark:bg-sky-950/20 rounded-xl p-3 text-center">
                <p className="text-[10px] text-slate-500 font-medium">Durée totale</p>
                <p className="text-[16px] font-extrabold text-sky-600 dark:text-sky-400 mt-0.5">
                  {fmtDuration(totalDuration)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
