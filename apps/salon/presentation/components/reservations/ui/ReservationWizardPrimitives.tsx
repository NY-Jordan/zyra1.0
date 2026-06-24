'use client'

import React from 'react'
import { Check, Clock, Scissors, User, Users, X } from 'lucide-react'
import { PersonBooking } from '../types'

// ── Stepper ──────────────────────────────────────────────────────────────────

export const PHASES = [
  { label: 'Prestation(s)', icon: Scissors },
  { label: 'Clients', icon: Users },
  { label: 'Finalisation', icon: Check },
]

export function Stepper({ current }: { current: number }) {
  return (
    <div className="flex items-center px-1">
      {PHASES.map((phase, i) => {
        const done = i < current
        const active = i === current
        const Icon = phase.icon
        return (
          <React.Fragment key={phase.label}>
            <div className="flex flex-col items-center gap-1.5">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                done
                  ? 'bg-emerald-500 text-white'
                  : active
                  ? 'bg-emerald-500 text-white ring-4 ring-emerald-100 dark:ring-emerald-900/30'
                  : 'bg-[#F5F2EF] dark:bg-slate-700 text-slate-400 dark:text-slate-500'
              }`}>
                {done ? <Check className="w-4 h-4" /> : <Icon className="w-3.5 h-3.5" />}
              </div>
              <span className={`text-[10px] font-semibold whitespace-nowrap ${
                active || done ? 'text-slate-700 dark:text-slate-300' : 'text-slate-400 dark:text-slate-600'
              }`}>
                {phase.label}
              </span>
            </div>
            {i < PHASES.length - 1 && (
              <div className={`flex-1 h-0.5 mx-2 mb-4 rounded-full transition-colors ${
                i < current ? 'bg-emerald-400' : 'bg-[#F0EAE4] dark:bg-slate-700'
              }`} />
            )}
          </React.Fragment>
        )
      })}
    </div>
  )
}

// ── Toggle ────────────────────────────────────────────────────────────────────

export function Toggle({ checked, onChange, id }: { checked: boolean; onChange: () => void; id?: string }) {
  return (
    <button
      type="button" id={id} role="switch" aria-checked={checked} onClick={onChange}
      className={`relative flex-shrink-0 w-9 h-5 rounded-full transition-colors duration-200 focus:outline-none ${
        checked ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-700'
      }`}
    >
      <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${
        checked ? 'translate-x-4' : 'translate-x-0'
      }`} />
    </button>
  )
}

// ── SelectableRow ─────────────────────────────────────────────────────────────

export function SelectableRow({ selected, onClick, icon, label, meta, disabled }: {
  selected: boolean
  onClick: () => void
  icon?: React.ReactNode
  label: string
  meta?: React.ReactNode
  disabled?: boolean
}) {
  return (
    <button
      type="button" aria-pressed={selected} onClick={onClick} disabled={disabled}
      className={`w-full flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-xl border transition-all text-left disabled:opacity-40 ${
        selected
          ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/20'
          : 'border-[#F0EAE4] dark:border-slate-700 hover:border-emerald-200 dark:hover:border-emerald-800/60'
      }`}
    >
      <span className="flex items-center gap-2.5 min-w-0">
        {icon}
        <span className="text-[13px] font-medium text-slate-700 dark:text-slate-300 truncate">{label}</span>
      </span>
      <span className="flex items-center gap-2 flex-shrink-0">
        {meta}
        <span className={`w-[18px] h-[18px] rounded-full flex items-center justify-center transition-colors ${
          selected ? 'bg-emerald-500' : 'bg-[#F0EAE4] dark:bg-slate-700'
        }`}>
          {selected && <Check className="w-2.5 h-2.5 text-white" />}
        </span>
      </span>
    </button>
  )
}

// ── FieldLabel ────────────────────────────────────────────────────────────────

export function FieldLabel({ children, htmlFor }: { children: React.ReactNode; htmlFor?: string }) {
  return (
    <label
      htmlFor={htmlFor}
      className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide block mb-1.5"
    >
      {children}
    </label>
  )
}

// ── PersonSummaryCard ─────────────────────────────────────────────────────────

export function PersonSummaryCard({ booking, index, serviceName, hairdresserName, canRemove, onRemove }: {
  booking: PersonBooking
  index: number
  serviceName?: string
  hairdresserName?: string
  canRemove?: boolean
  onRemove?: () => void
}) {
  return (
    <div className="px-3.5 py-3 rounded-xl border border-[#F0EAE4] dark:border-slate-700 bg-[#FAFAF9] dark:bg-slate-800/30 space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wide">
          Personne {index + 1}
        </span>
        {canRemove && onRemove && (
          <button
            type="button" onClick={onRemove}
            className="flex items-center gap-1 text-[11px] font-semibold text-rose-500 hover:text-rose-600 transition-colors"
          >
            <X className="w-3 h-3" />
            Supprimer
          </button>
        )}
      </div>
      <div className="text-[12px] text-slate-600 dark:text-slate-300 space-y-0.5">
        <div className="flex items-center gap-1.5">
          <Scissors className="w-3 h-3 text-slate-400 flex-shrink-0" />
          {serviceName ?? '—'}
        </div>
        <div className="flex items-center gap-1.5">
          <User className="w-3 h-3 text-slate-400 flex-shrink-0" />
          {hairdresserName ?? '—'}
        </div>
        <div className="flex items-center gap-1.5">
          <Clock className="w-3 h-3 text-slate-400 flex-shrink-0" />
          {booking.date?.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }) ?? '—'} à {booking.time ?? '—'}
        </div>
      </div>
    </div>
  )
}
