'use client'

import React, { useEffect } from 'react'
import { Info, UserCheck, UserPlus } from 'lucide-react'
import { Input } from '@zyra/ui/components/input'
import { where } from 'firebase/firestore'
import { fetchCollection } from '@zyra/conf/lib/query'
import { IClient } from '@zyra/conf/domain/entities/clients.entities'
import { PersonBooking } from '../types'
import { FieldLabel, Toggle } from '../ui/ReservationWizardPrimitives'

interface ClientInfoStepProps {
  currentIndex: number
  totalCount: number
  booking: PersonBooking
  serviceName: string | undefined
  hairdresserName: string | undefined
  salonId: string | null
  duplicateClient: IClient | null
  onUpdate: (updates: Partial<PersonBooking>) => void
  onOpenSearch: () => void
  onRemoveImported: () => void
  onDuplicateChange: (client: IClient | null) => void
  onImportDuplicate: (client: IClient) => void
}

export function ClientInfoStep({
  currentIndex,
  totalCount,
  booking,
  serviceName,
  hairdresserName,
  salonId,
  duplicateClient,
  onUpdate,
  onOpenSearch,
  onRemoveImported,
  onDuplicateChange,
  onImportDuplicate,
}: ClientInfoStepProps) {
  // Debounced phone lookup — same logic as NewOrderModal
  useEffect(() => {
    if (booking.linkedClientId || !booking.clientPhone || !salonId) {
      onDuplicateChange(null)
      return
    }
    const timeout = setTimeout(async () => {
      try {
        const matches = await fetchCollection('clients', [
          where('salonId', '==', salonId),
          where('phone', '==', booking.clientPhone),
        ]) as IClient[]
        onDuplicateChange(matches[0] ?? null)
      } catch {
        onDuplicateChange(null)
      }
    }, 500)
    return () => clearTimeout(timeout)
  }, [booking.clientPhone, booking.linkedClientId, salonId])

  return (
    <div className="space-y-4">
      {/* Context pill */}
      <div className="px-3.5 py-2.5 rounded-xl bg-[#F8F4F0] dark:bg-slate-800/40 flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-white text-[11px] font-bold flex-shrink-0">
          {currentIndex + 1}
        </div>
        <div className="text-[12px] text-slate-600 dark:text-slate-300 min-w-0">
          <div className="font-semibold truncate">{serviceName ?? '—'}</div>
          <div className="text-slate-400 truncate">{hairdresserName ?? '—'} · {booking.time ?? '—'}</div>
        </div>
        {totalCount > 1 && (
          <span className="ml-auto text-[11px] font-semibold text-slate-400 flex-shrink-0">
            {currentIndex + 1} / {totalCount}
          </span>
        )}
      </div>

      {booking.linkedClientId ? (
        <div className="flex items-center justify-between px-3.5 py-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/50">
          <div className="flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span className="text-[12px] font-semibold text-emerald-700 dark:text-emerald-400">Client existant importé</span>
          </div>
          <button
            type="button"
            onClick={onRemoveImported}
            className="text-[11px] font-bold text-rose-500 hover:text-rose-600 hover:underline"
          >
            Retirer
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={onOpenSearch}
          className="w-full flex items-center justify-center gap-2 h-10 rounded-xl border border-dashed border-emerald-300 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 text-[13px] font-semibold hover:bg-emerald-50 dark:hover:bg-emerald-950/20 transition-colors"
        >
          <UserPlus className="w-4 h-4" />
          Importer un client existant
        </button>
      )}

      <div>
        <FieldLabel htmlFor={`name-${currentIndex}`}>Nom complet *</FieldLabel>
        <Input
          id={`name-${currentIndex}`}
          value={booking.clientName}
          onChange={e => onUpdate({ clientName: e.target.value })}
          placeholder="Ex: Jean Dupont"
          disabled={!!booking.linkedClientId}
          className="h-10 rounded-xl border-[#E8E0D8] dark:border-slate-700 disabled:opacity-60 disabled:bg-[#F8F4F0] dark:disabled:bg-slate-800/40"
        />
      </div>

      <div>
        <FieldLabel htmlFor={`phone-${currentIndex}`}>Téléphone *</FieldLabel>
        <Input
          id={`phone-${currentIndex}`}
          type="tel"
          value={booking.clientPhone}
          onChange={e => onUpdate({ clientPhone: e.target.value })}
          placeholder="Ex: +237 6XX XX XX XX"
          disabled={!!booking.linkedClientId}
          className="h-10 rounded-xl border-[#E8E0D8] dark:border-slate-700 disabled:opacity-60 disabled:bg-[#F8F4F0] dark:disabled:bg-slate-800/40"
        />
      </div>

      <div>
        <FieldLabel htmlFor={`email-${currentIndex}`}>Email (optionnel)</FieldLabel>
        <Input
          id={`email-${currentIndex}`}
          type="email"
          value={booking.clientEmail}
          onChange={e => onUpdate({ clientEmail: e.target.value })}
          placeholder="Ex: jean@example.com"
          disabled={!!booking.linkedClientId}
          className="h-10 rounded-xl border-[#E8E0D8] dark:border-slate-700 disabled:opacity-60 disabled:bg-[#F8F4F0] dark:disabled:bg-slate-800/40"
        />
      </div>

      {!booking.linkedClientId && (
        <div className="flex items-center justify-between px-3.5 py-3 bg-[#F8F4F0] dark:bg-slate-800/40 rounded-xl">
          <label htmlFor={`save-${currentIndex}`} className="text-[12px] font-semibold text-slate-600 dark:text-slate-300 cursor-pointer">
            Enregistrer comme client régulier
          </label>
          <Toggle
            id={`save-${currentIndex}`}
            checked={booking.saveAsRegularClient}
            onChange={() => onUpdate({ saveAsRegularClient: !booking.saveAsRegularClient })}
          />
        </div>
      )}

      {/* Duplicate warnings — mirrors NewOrderModal behaviour */}
      {duplicateClient && (
        booking.saveAsRegularClient ? (
          // Toggle ON + doublon : avertissement bloquant, propose d'importer
          <div className="space-y-1.5 px-3.5 py-3 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/50">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[12px] font-semibold text-amber-800 dark:text-amber-300">Client déjà existant</p>
                <p className="text-[11px] text-amber-700 dark:text-amber-400 truncate">
                  &ldquo;{duplicateClient.name}&rdquo; utilise déjà ce numéro de téléphone.
                </p>
              </div>
              <button
                type="button"
                onClick={() => onImportDuplicate(duplicateClient)}
                className="flex-shrink-0 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
              >
                Importer ce client
              </button>
            </div>
            <p className="text-[10px] text-amber-600/80 dark:text-amber-500/70">
              Importez ce client ou décochez &ldquo;client régulier&rdquo; pour continuer.
            </p>
          </div>
        ) : (
          // Toggle OFF : signal informatif seulement, pas de blocage
          <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-sky-50 dark:bg-sky-950/20 border border-sky-200 dark:border-sky-800/50">
            <Info className="w-3.5 h-3.5 text-sky-500 dark:text-sky-400 flex-shrink-0" />
            <p className="text-[11px] text-sky-700 dark:text-sky-400">
              &ldquo;{duplicateClient.name}&rdquo; existe déjà avec ce numéro de téléphone.
            </p>
          </div>
        )
      )}
    </div>
  )
}
