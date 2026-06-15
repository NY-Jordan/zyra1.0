'use client'
import { Dialog, DialogContent, DialogTitle } from '@zyra/ui/components/dialog'
import { Scissors, MapPin, Users, ArrowRight } from 'lucide-react'

interface WelcomeModalProps {
  open: boolean
  salonName?: string
  onContinue: () => void
  isLoading?: boolean
}

export default function WelcomeModal({ open, salonName, onContinue, isLoading }: WelcomeModalProps) {
  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent
        className="max-w-md w-full"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogTitle className="sr-only">Bienvenue sur Zyra</DialogTitle>

        <div className="text-center py-2">
          {/* Icon */}
          <div className="w-16 h-16 bg-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-100 dark:shadow-emerald-900/30">
            <Scissors className="w-7 h-7 text-white" />
          </div>

          <h2 className="text-[22px] font-extrabold text-slate-800 dark:text-white mb-1">
            Bienvenue sur Zyra !
          </h2>
          {salonName && (
            <p className="text-[14px] font-semibold text-emerald-600 dark:text-emerald-400 mb-3">
              {salonName}
            </p>
          )}
          <p className="text-[13px] text-slate-500 dark:text-slate-400 max-w-xs mx-auto mb-8">
            Quelques étapes rapides pour configurer votre salon et accueillir vos premiers clients.
          </p>

          {/* Steps */}
          <div className="space-y-2 mb-8 text-left">
            {[
              { icon: Scissors, label: 'Configurer vos horaires d\'ouverture', step: '01' },
              { icon: MapPin, label: 'Ajouter votre localisation', step: '02' },
              { icon: Users, label: 'Créer vos services et inviter votre équipe', step: '03' },
            ].map(({ icon: Icon, label, step }) => (
              <div key={step} className="flex items-center gap-3 bg-[#F8F4F0] dark:bg-slate-800/50 rounded-xl px-4 py-2.5">
                <span className="text-[11px] font-bold text-emerald-500 w-5 flex-shrink-0">{step}</span>
                <Icon className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                <span className="text-[12px] text-slate-600 dark:text-slate-300">{label}</span>
              </div>
            ))}
          </div>

          {/* CTA */}
          <button
            onClick={onContinue}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-60 text-white font-semibold text-[14px] py-3 rounded-xl transition-all"
          >
            {isLoading
              ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              : <>Commencer la configuration <ArrowRight className="w-4 h-4" /></>
            }
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
