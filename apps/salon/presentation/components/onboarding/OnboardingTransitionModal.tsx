'use client'
import { Dialog, DialogContent, DialogTitle } from '@zyra/ui/components/dialog'
import { CheckCircle, ArrowRight, Trophy, Star } from 'lucide-react'

type TransitionVariant = 'config' | 'services' | 'done'

interface OnboardingTransitionModalProps {
  open: boolean
  variant: TransitionVariant
  onCta: () => void
  isLoading?: boolean
}

const CONTENT: Record<TransitionVariant, {
  icon: React.ReactNode
  bg: string
  title: string
  description: string
  cta: string
}> = {
  config: {
    icon: <CheckCircle className="w-7 h-7 text-white" />,
    bg: 'bg-emerald-500 shadow-emerald-100 dark:shadow-emerald-900/30',
    title: 'Configuration terminée !',
    description: 'Excellent ! Votre salon est configuré et localisé. Créez maintenant votre premier service pour commencer à accueillir des clients.',
    cta: 'Créer mon premier service',
  },
  services: {
    icon: <Star className="w-7 h-7 text-white" />,
    bg: 'bg-violet-500 shadow-violet-100 dark:shadow-violet-900/30',
    title: 'Premier service créé !',
    description: 'Bravo ! Votre catalogue démarre. Invitez maintenant votre premier coiffeur pour compléter votre équipe.',
    cta: 'Inviter un coiffeur',
  },
  done: {
    icon: <Trophy className="w-7 h-7 text-white" />,
    bg: 'bg-amber-500 shadow-amber-100 dark:shadow-amber-900/30',
    title: 'Votre salon est prêt !',
    description: 'Félicitations ! Vous avez tout configuré. Votre salon est opérationnel sur Zyra. Bienvenue dans l\'aventure !',
    cta: 'Accéder au tableau de bord',
  },
}

export default function OnboardingTransitionModal({
  open, variant, onCta, isLoading,
}: OnboardingTransitionModalProps) {
  const c = CONTENT[variant]

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent
        className="max-w-sm w-full"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogTitle className="sr-only">{c.title}</DialogTitle>

        <div className="text-center py-2">
          <div className={`w-16 h-16 ${c.bg} rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg`}>
            {c.icon}
          </div>

          <h2 className="text-[20px] font-extrabold text-slate-800 dark:text-white mb-3">
            {c.title}
          </h2>
          <p className="text-[13px] text-slate-500 dark:text-slate-400 leading-relaxed mb-8">
            {c.description}
          </p>

          <button
            onClick={onCta}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-60 text-white font-semibold text-[14px] py-3 rounded-xl transition-all"
          >
            {isLoading
              ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              : <>{c.cta} <ArrowRight className="w-4 h-4" /></>
            }
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
