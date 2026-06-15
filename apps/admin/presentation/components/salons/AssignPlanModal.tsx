'use client'
import React, { useState } from 'react'
import {
  Dialog, DialogContent, DialogClose, DialogTitle,
} from '@zyra/ui/components/dialog'
import { Button } from '@zyra/ui/components/button'
import { IPackage } from '@zyra/conf/domain/entities/package.entities'
import { useSalonPackages } from '@/usecases/subscriptionUseCases'
import { X, Check, Calendar, Zap, Star, ChevronRight } from 'lucide-react'

// ── Period shortcuts ──────────────────────────────────────────────────────────

type PeriodKey = '3m' | '6m' | '1y' | 'custom'

const PERIODS: { key: PeriodKey; label: string; months?: number }[] = [
  { key: '3m', label: '3 mois', months: 3 },
  { key: '6m', label: '6 mois', months: 6 },
  { key: '1y', label: '1 an', months: 12 },
  { key: 'custom', label: 'Personnalisé' },
]

function addMonths(date: Date, months: number) {
  const d = new Date(date)
  d.setMonth(d.getMonth() + months)
  return d
}

function fmtDate(d: Date) {
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
}

function toInputDate(d: Date) {
  return d.toISOString().split('T')[0]
}

// ── Package card ──────────────────────────────────────────────────────────────

function PackageCard({ pkg, selected, onSelect }: {
  pkg: IPackage; selected: boolean; onSelect: () => void
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`relative w-full text-left rounded-2xl border-2 p-4 transition-all ${
        selected
          ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 dark:border-emerald-600'
          : 'border-[#F0EAE4] dark:border-slate-700 bg-white dark:bg-slate-800/50 hover:border-emerald-300 dark:hover:border-emerald-700'
      }`}
    >
      {pkg.popular && (
        <span className="absolute -top-2.5 right-3 text-[10px] font-bold bg-amber-400 text-white px-2 py-0.5 rounded-full flex items-center gap-0.5">
          <Star className="w-2.5 h-2.5 fill-white" /> Populaire
        </span>
      )}
      {selected && (
        <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center">
          <Check className="w-3 h-3 text-white" />
        </div>
      )}
      <div className="pr-6">
        <p className="text-[14px] font-bold text-slate-800 dark:text-white">{pkg.name}</p>
        <p className="text-[20px] font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">
          {pkg.price === 0 ? 'Gratuit' : `${pkg.price.toLocaleString('fr-FR')} ${pkg.currency}`}
        </p>
        <p className="text-[11px] text-slate-400 mt-0.5">{pkg.duration} jours</p>
      </div>
      {pkg.features?.length > 0 && (
        <ul className="mt-3 space-y-1">
          {pkg.features.slice(0, 4).map((f, i) => (
            <li key={i} className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
              <div className="w-3.5 h-3.5 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center flex-shrink-0">
                <Check className="w-2 h-2 text-emerald-600 dark:text-emerald-400" />
              </div>
              {f}
            </li>
          ))}
          {pkg.features.length > 4 && (
            <li className="text-[10px] text-slate-400">+{pkg.features.length - 4} autres…</li>
          )}
        </ul>
      )}
    </button>
  )
}

// ── Modal ─────────────────────────────────────────────────────────────────────

export default function AssignPlanModal({
  open,
  onOpenChange,
  onConfirm,
  confirming,
  title = 'Choisir un forfait',
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (pkg: IPackage, endDate: Date) => Promise<void>
  confirming?: boolean
  title?: string
}) {
  const { data: packages = [], isLoading } = useSalonPackages()
  const [selectedPkg, setSelectedPkg] = useState<IPackage | null>(null)
  const [period, setPeriod] = useState<PeriodKey>('1y')
  const [customDate, setCustomDate] = useState<string>(() => {
    const parts = addMonths(new Date(), 12).toISOString().split('T')
    return parts[0] ?? ''
  })

  const today = new Date()
  const endDate: Date = period === 'custom'
    ? (customDate ? new Date(customDate) : addMonths(today, 12))
    : addMonths(today, PERIODS.find(p => p.key === period)!.months!)

  const canConfirm = !!selectedPkg && endDate > today

  const handleConfirm = async () => {
    if (!selectedPkg || !canConfirm) return
    await onConfirm(selectedPkg, endDate)
    setSelectedPkg(null)
    setPeriod('1y')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-2xl p-0 overflow-hidden dark:bg-[#161B24] border border-[#F0EAE4] dark:border-slate-800/50 rounded-2xl gap-0"
        onInteractOutside={e => e.preventDefault()}
      >
        <DialogTitle className="sr-only">Choisir un forfait</DialogTitle>
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-[#F0EAE4] dark:border-slate-800/50">
          <div>
            <h2 className="text-[16px] font-extrabold text-slate-800 dark:text-white">{title}</h2>
            <p className="text-[12px] text-slate-400 mt-0.5">Un forfait est requis pour activer le salon</p>
          </div>
          <DialogClose className="w-7 h-7 rounded-full bg-[#F5F2EF] dark:bg-slate-700 flex items-center justify-center text-slate-500 hover:text-slate-700 transition-colors">
            <X className="w-3.5 h-3.5" />
          </DialogClose>
        </div>

        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">

          {/* Package grid */}
          <div>
            <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide mb-3">
              Forfaits disponibles
            </p>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="w-6 h-6 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : packages.length === 0 ? (
              <p className="text-[13px] text-slate-400 text-center py-6">
                Aucun forfait salon disponible. Créez-en un dans la section Forfaits.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {packages.map(pkg => (
                  <PackageCard
                    key={pkg.id}
                    pkg={pkg}
                    selected={selectedPkg?.id === pkg.id}
                    onSelect={() => setSelectedPkg(pkg)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Period selection */}
          <div className="border-t border-[#F0EAE4] dark:border-slate-800/50 pt-5">
            <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide mb-3">
              Période d'abonnement
            </p>

            <div className="flex gap-2 flex-wrap mb-4">
              {PERIODS.map(p => (
                <button
                  key={p.key}
                  type="button"
                  onClick={() => setPeriod(p.key)}
                  className={`px-4 py-2 rounded-xl text-[12px] font-bold transition-all ${
                    period === p.key
                      ? 'bg-emerald-500 text-white shadow-sm'
                      : 'bg-[#F5F2EF] dark:bg-slate-700/50 text-slate-600 dark:text-slate-400 hover:bg-[#EDE8E3] dark:hover:bg-slate-700'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>

            {period === 'custom' && (
              <div className="mb-4">
                <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide block mb-1.5">
                  Date de fin
                </label>
                <input
                  type="date"
                  value={customDate}
                  min={toInputDate(addMonths(today, 1))}
                  onChange={e => setCustomDate(e.target.value)}
                  className="h-10 px-3 rounded-xl border border-[#E8E0D8] dark:border-slate-700 bg-white dark:bg-slate-800 text-[13px] text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-400/40"
                />
              </div>
            )}

            {/* Date summary */}
            <div className="flex items-center gap-3 px-4 py-3 bg-[#F8F4F0] dark:bg-slate-800/40 rounded-xl">
              <Calendar className="w-4 h-4 text-emerald-500 flex-shrink-0" />
              <div className="flex items-center gap-2 flex-wrap text-[13px]">
                <span className="font-semibold text-slate-700 dark:text-slate-300">{fmtDate(today)}</span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                <span className="font-bold text-emerald-600 dark:text-emerald-400">{fmtDate(endDate)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-[#F0EAE4] dark:border-slate-800/50 bg-[#FAF7F4] dark:bg-slate-800/30">
          {!canConfirm && (
            <p className="text-[11px] text-rose-500 font-medium">
              {!selectedPkg ? 'Sélectionnez un forfait' : 'Date de fin invalide'}
            </p>
          )}
          {canConfirm && selectedPkg && (
            <div className="flex items-center gap-2">
              <Zap className="w-3.5 h-3.5 text-emerald-500" />
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                <span className="font-bold text-emerald-600">{selectedPkg.name}</span>
                {' · '}{fmtDate(endDate)}
              </p>
            </div>
          )}
          <div className={`flex gap-2 ml-auto ${!canConfirm ? 'ml-auto' : ''}`}>
            <DialogClose asChild>
              <Button variant="outline" size="sm" className="h-9 text-[12px]" disabled={confirming}>
                Annuler
              </Button>
            </DialogClose>
            <Button
              size="sm"
              disabled={!canConfirm || confirming}
              onClick={handleConfirm}
              className="h-9 text-[12px] bg-[#0b0b14] dark:bg-emerald-600 text-white hover:opacity-90 px-5"
            >
              {confirming ? 'Création…' : 'Confirmer le forfait'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
