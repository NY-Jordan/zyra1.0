'use client'
import { useRouter } from 'next/navigation'
import { Scissors, Users, ArrowRight, Sparkles } from 'lucide-react'

interface OnboardingBannerProps {
  step: 'services' | 'hairdressers'
}

const BANNER = {
  services: {
    icon: Scissors,
    label: 'Étape 1 sur 2',
    title: 'Créez votre premier service',
    description: 'Ajoutez un service pour que vos clients puissent réserver.',
    cta: 'Créer un service',
    href: '/salon/services',
  },
  hairdressers: {
    icon: Users,
    label: 'Étape 2 sur 2',
    title: 'Invitez votre premier coiffeur',
    description: 'Constituez votre équipe en invitant un coiffeur.',
    cta: 'Inviter un coiffeur',
    href: '/salon/hair-dressers',
  },
}

export default function OnboardingBanner({ step }: OnboardingBannerProps) {
  const router = useRouter()
  const b = BANNER[step]
  const Icon = b.icon

  return (
    <div className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 px-4 py-3">
      <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0 w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
            <Icon className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-emerald-100 uppercase tracking-widest">{b.label}</span>
              <Sparkles className="w-3 h-3 text-emerald-200" />
            </div>
            <p className="text-[13px] font-semibold text-white">{b.title}
              <span className="hidden sm:inline font-normal text-emerald-100"> — {b.description}</span>
            </p>
          </div>
        </div>

        <button
          onClick={() => router.push(b.href)}
          className="flex-shrink-0 flex items-center gap-1.5 bg-white text-emerald-600 font-semibold text-[12px] px-4 py-1.5 rounded-lg hover:bg-emerald-50 transition-colors"
        >
          {b.cta} <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  )
}
