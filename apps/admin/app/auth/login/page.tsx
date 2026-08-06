'use client'
import { Button } from '@zyra/ui/components/button'
import { Input } from '@zyra/ui/components/input'
import { LoadingSpinner } from '@/presentation/components/LoadingSpinner'
import { useForm, FieldValues } from "react-hook-form"
import { toast } from 'sonner'
import { isBlocked, LoginByEmail, recordAttempt } from '@/services/AuthService'
import { StatusCodeEnum } from '@zyra/conf/domain/enums/StatusCodeEnum'
import { formatCountdown } from '@zyra/conf/lib/utils'
import PublicLayout from '@/presentation/layouts/PublicLayout'
import { editDocument } from '@zyra/conf/lib/query'
import { useEffect, useState } from 'react'

function ZyraMark({ light = false }: { light?: boolean }) {
  const color = light ? '#ffffff' : '#0b0b14'
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <path
        d="M6 7H26L6 25H26"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export default function Login() {
  const [loading, setLoading] = useState(false)
  const [blockedUntil, setBlockedUntil] = useState<number | null>(null)
  const [countdown, setCountdown] = useState<number>(0)
  const { register, handleSubmit, formState: { errors } } = useForm()
  const [now] = useState(() => Date.now())
  const isBlockedNow = blockedUntil && now < blockedUntil

  useEffect(() => {
    if (isBlockedNow) {
      const interval = setInterval(() => {
        const remaining = blockedUntil - Date.now()
        setCountdown(remaining > 0 ? remaining : 0)
        if (remaining <= 0) {
          setBlockedUntil(null)
          setCountdown(0)
          const email = localStorage.getItem('emailForSignIn')
          if (email) {
            editDocument("login_attempts", email, { attempts: 0, blockedUntil: null })
          }
          clearInterval(interval)
        }
      }, 1000)
      return () => clearInterval(interval)
    }
  }, [blockedUntil])

  const handleLogin = async (data: FieldValues) => {
    setLoading(true)
    const blockInfo = await isBlocked(data.email)
    if (blockInfo.blocked) {
      setBlockedUntil(blockInfo.blockedUntil!)
      setLoading(false)
      toast.error("Trop de tentatives. Veuillez patienter 5 minutes avant de réessayer.")
      return
    }

    const result = await LoginByEmail(data.email)
    await recordAttempt(data.email)
    setLoading(false)
    const afterBlockInfo = await isBlocked(data.email)
    if (afterBlockInfo.blocked) {
      setBlockedUntil(afterBlockInfo.blockedUntil!)
      toast.error("Trop de tentatives. Veuillez patienter 5 minutes avant de réessayer.")
      return
    }

    if (result === StatusCodeEnum.OK) {
      localStorage.setItem('emailForSignIn', data.email)
      toast.success('Lien envoyé. Vérifiez votre boîte de réception.')
      return
    }
    if (result === StatusCodeEnum.NOT_FOUND) {
      toast.error('Aucun compte trouvé avec cet email.')
      return
    }
    toast.error('Une erreur est survenue. Veuillez réessayer.')
  }

  return (
    <PublicLayout>
      <div className="min-h-screen flex">

        {/* ── Left brand panel (desktop only) ── */}
        <div className="hidden lg:flex lg:w-[45%] bg-[#0b0b14] flex-col justify-between p-12 relative overflow-hidden select-none">
          {/* Grid texture */}
          <div
            className="absolute inset-0 opacity-[0.035]"
            style={{
              backgroundImage:
                'linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)',
              backgroundSize: '48px 48px',
            }}
          />

          {/* Top: Logo */}
          <div className="relative z-10">
            <div className="flex items-center gap-3">
              <ZyraMark light />
              <span className="text-white text-xl font-semibold tracking-[0.12em] uppercase">
                Zyraa
              </span>
            </div>
            <div className="mt-1 ml-[44px]">
              <span className="text-white/25 text-[10px] tracking-[0.3em] uppercase font-medium">
                Administration
              </span>
            </div>
          </div>

          {/* Center: Tagline */}
          <div className="relative z-10">
            <p className="text-white/70 text-2xl font-light leading-snug max-w-xs">
              Gérez votre plateforme<br />avec précision.
            </p>
            <div className="mt-6 flex items-center gap-2">
              <div className="w-8 h-px bg-white/20" />
              <span className="text-white/25 text-xs tracking-widest uppercase">Accès restreint</span>
            </div>
          </div>

          {/* Bottom: Version */}
          <div className="relative z-10">
            <p className="text-white/15 text-xs tracking-wide">
              © {new Date().getFullYear()} Zyraa · v1.0
            </p>
          </div>
        </div>

        {/* ── Right form panel ── */}
        <div className="flex-1 flex items-center justify-center bg-white dark:bg-[#0f0f18] p-6 sm:p-12">
          <div className="w-full max-w-[360px]">

            {/* Mobile logo */}
            <div className="lg:hidden flex items-center gap-3 mb-12">
              <ZyraMark />
              <div>
                <p className="text-[#0b0b14] dark:text-white text-lg font-semibold tracking-[0.12em] uppercase leading-none">
                  Zyraa
                </p>
                <p className="text-slate-400 text-[10px] tracking-[0.25em] uppercase mt-0.5">
                  Administration
                </p>
              </div>
            </div>

            {/* Header */}
            <div className="mb-10">
              <h1 className="text-[#0b0b14] dark:text-white text-2xl font-semibold tracking-tight">
                Connexion
              </h1>
              <p className="text-slate-400 dark:text-slate-500 text-sm mt-2 leading-relaxed">
                Entrez votre adresse email pour recevoir un lien de connexion sécurisé.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit(handleLogin)} className="space-y-5">
              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="block text-[11px] font-semibold tracking-[0.15em] uppercase text-slate-500 dark:text-slate-400"
                >
                  Adresse e-mail
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="vous@exemple.com"
                  className="h-11 text-sm bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-[#0b0b14] dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-600 focus-visible:ring-1 focus-visible:ring-[#0b0b14] dark:focus-visible:ring-white/30 focus-visible:border-[#0b0b14] dark:focus-visible:border-white/30 rounded-lg transition"
                  {...register("email", { required: true })}
                  disabled={!!isBlockedNow}
                />
                {errors?.email && (
                  <p className="text-xs text-red-500 dark:text-red-400">
                    L'adresse e-mail est requise
                  </p>
                )}
              </div>

              {isBlockedNow && (
                <div className="flex items-start gap-3 rounded-lg border border-red-100 dark:border-red-900/50 bg-red-50 dark:bg-red-950/30 px-4 py-3">
                  <div className="mt-1 w-1.5 h-1.5 rounded-full bg-red-500 shrink-0 animate-pulse" />
                  <p className="text-sm text-red-600 dark:text-red-400">
                    Trop de tentatives. Réessayez dans{' '}
                    <span className="font-semibold">{formatCountdown(countdown)}</span>
                  </p>
                </div>
              )}

              <Button
                type="submit"
                className="w-full h-11 text-sm font-medium bg-[#0b0b14] hover:bg-[#1a1a2e] dark:bg-white dark:text-[#0b0b14] dark:hover:bg-slate-100 text-white rounded-lg transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading || !!isBlockedNow}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2.5">
                    <LoadingSpinner className="h-4 w-4" />
                    <span>Envoi en cours…</span>
                  </span>
                ) : (
                  'Continuer'
                )}
              </Button>
            </form>

            {/* Footer */}
            <div className="mt-12 pt-8 border-t border-slate-100 dark:border-slate-800">
              <p className="text-xs text-slate-300 dark:text-slate-600">
                Accès réservé aux administrateurs Zyraa.
              </p>
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  )
}
