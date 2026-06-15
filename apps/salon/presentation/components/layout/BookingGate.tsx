'use client'
import React from 'react'
import Link from 'next/link'
import { Lock, Check, Scissors, Send, UserCheck, ArrowRight } from 'lucide-react'
import { useBookingAccess } from '@/hooks/useBookingAccess'

const STEPS = [
  {
    key: 'hasServices' as const,
    icon: Scissors,
    label: 'Créer au moins un service',
    doneLabel: 'Service créé',
    description: 'Ajoutez les prestations proposées par votre salon.',
    href: '/salon/services',
    hrefLabel: 'Gérer les services',
  },
  {
    key: 'hasInvitation' as const,
    icon: Send,
    label: 'Envoyer une invitation à un coiffeur',
    doneLabel: 'Invitation envoyée',
    description: 'Invitez un coiffeur à rejoindre votre salon.',
    href: '/salon/hair-dressers',
    hrefLabel: 'Inviter un coiffeur',
  },
  {
    key: 'hasValidatedHairdresser' as const,
    icon: UserCheck,
    label: 'En attente de validation du coiffeur',
    doneLabel: 'Coiffeur actif',
    description: "Le coiffeur doit accepter l'invitation depuis son application.",
    href: null,
    hrefLabel: null,
  },
]

export default function BookingGate({ children }: { children: React.ReactNode }) {
  const access = useBookingAccess()
  const { isReady, isLoading } = access

  if (isLoading) return null
  if (isReady) return <>{children}</>

  const currentStepIndex = STEPS.findIndex(s => !access[s.key])

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-6">
      <div className="max-w-sm w-full text-center">

        {/* Icon */}
        <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-5">
          <Lock className="w-6 h-6 text-slate-400 dark:text-slate-500" />
        </div>

        <h2 className="text-[19px] font-extrabold text-slate-800 dark:text-white mb-1.5">
          Section verrouillée
        </h2>
        <p className="text-[13px] text-slate-500 dark:text-slate-400 mb-7">
          Complétez les{' '}
          <span className="font-semibold text-slate-700 dark:text-slate-300">3 étapes</span>{' '}
          ci-dessous pour débloquer les réservations.
        </p>

        {/* Steps */}
        <div className="space-y-2.5 text-left">
          {STEPS.map((step, i) => {
            const done = !!access[step.key]
            const isCurrent = i === currentStepIndex
            const isUpcoming = i > currentStepIndex
            const Icon = step.icon

            return (
              <div
                key={step.key}
                className={`relative flex items-start gap-3 rounded-2xl px-4 py-3.5 border transition-all ${
                  done
                    ? 'bg-emerald-50 dark:bg-emerald-900/15 border-emerald-200 dark:border-emerald-800/40'
                    : isCurrent
                    ? 'bg-amber-50 dark:bg-amber-900/15 border-amber-300 dark:border-amber-700/50'
                    : 'bg-[#F8F4F0] dark:bg-slate-800/40 border-[#EDE8E3] dark:border-slate-700/50 opacity-50'
                }`}
              >
                {/* Step indicator */}
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${
                  done
                    ? 'bg-emerald-500'
                    : isCurrent
                    ? 'bg-amber-400'
                    : 'bg-slate-200 dark:bg-slate-700'
                }`}>
                  {done
                    ? <Check className="w-4 h-4 text-white" />
                    : <Icon className={`w-4 h-4 ${isCurrent ? 'text-white' : 'text-slate-400'}`} />
                  }
                </div>

                <div className="flex-1 min-w-0">
                  {/* Step number + label */}
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className={`text-[10px] font-bold uppercase tracking-wide ${
                      done ? 'text-emerald-500' : isCurrent ? 'text-amber-500' : 'text-slate-400'
                    }`}>
                      Étape {i + 1}
                    </span>
                  </div>
                  <p className={`text-[13px] font-semibold leading-tight ${
                    done
                      ? 'text-emerald-700 dark:text-emerald-300'
                      : isCurrent
                      ? 'text-amber-800 dark:text-amber-200'
                      : 'text-slate-500 dark:text-slate-400'
                  }`}>
                    {done ? step.doneLabel : step.label}
                  </p>
                  {isCurrent && !done && (
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                      {step.description}
                    </p>
                  )}
                  {isCurrent && !done && step.href && (
                    <Link
                      href={step.href}
                      className="inline-flex items-center gap-1 mt-2 text-[11px] font-semibold text-amber-700 dark:text-amber-300 hover:underline underline-offset-2"
                    >
                      {step.hrefLabel} <ArrowRight className="w-3 h-3" />
                    </Link>
                  )}
                </div>

                {/* Done badge */}
                {done && (
                  <span className="text-[10px] font-bold text-emerald-500 flex-shrink-0 self-center">✓</span>
                )}
              </div>
            )
          })}
        </div>

        <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-6">
          Cette section se déverrouille automatiquement une fois toutes les étapes complétées.
        </p>
      </div>
    </div>
  )
}
