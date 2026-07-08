'use client'

import { useForm, FieldValues } from 'react-hook-form'
import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { Mail, Lock, ArrowRight, AlertCircle, Sparkle } from 'lucide-react'
import { ownerAuthService } from '@/services/ownerAuthService'
import { useRouter } from 'next/navigation'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '@zyra/conf/lib/firebase'

export default function Login() {
  const { register, handleSubmit, formState: { errors } } = useForm()
  const [isLoading, setIsLoading] = useState(false)
  const [connectionError, setConnectionError] = useState('')
  const router = useRouter()

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, user => {
      if (user) router.replace('/salon/setup')
    })
    return unsub
  }, [router])

  const handleAuth = async (data: FieldValues) => {
    setConnectionError('')
    setIsLoading(true)
    try {
      await ownerAuthService.login(data.email, data.password)
      if (typeof window !== 'undefined') localStorage.removeItem('salonId')
      toast.success('Connexion réussie')
      window.location.href = '/salon/setup'
    } catch (error: any) {
      setConnectionError(error.message || 'Une erreur est survenue. Vérifiez votre connexion internet.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 py-12 overflow-hidden bg-gradient-to-br from-slate-100 via-white to-slate-100 dark:from-[#080A0E] dark:via-[#0B0E12] dark:to-[#0F1319]">

      {/* Dot grid texture */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.5] dark:opacity-[0.35] [background-image:radial-gradient(circle,_rgba(100,116,139,0.35)_1px,_transparent_1px)] dark:[background-image:radial-gradient(circle,_rgba(148,163,184,0.5)_1px,_transparent_1px)] [background-size:26px_26px]" />

      {/* Ambient glow blobs */}
      <div className="pointer-events-none absolute -top-40 -left-32 h-96 w-96 rounded-full bg-emerald-400/25 dark:bg-emerald-500/30 blur-[110px]" />
      <div className="pointer-events-none absolute -bottom-40 -right-32 h-96 w-96 rounded-full bg-emerald-300/25 dark:bg-emerald-400/25 blur-[110px]" />
      <div className="pointer-events-none absolute top-1/3 right-0 h-72 w-72 rounded-full bg-sky-300/15 dark:bg-sky-500/25 blur-[110px]" />

      {/* Radial vignette to keep focus on the card */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_35%,_rgba(255,255,255,0.6)_100%)] dark:bg-[radial-gradient(ellipse_at_center,_transparent_35%,_rgba(3,5,8,0.5)_100%)]" />


      <div className="relative w-full max-w-[420px]">

        {/* Card */}
        <div className="relative rounded-[28px] border border-slate-200 dark:border-white/5 shadow-[0_8px_40px_rgba(0,0,0,0.06)] dark:shadow-[0_25px_70px_rgba(0,0,0,0.55)] bg-[linear-gradient(120deg,#ffffff_46%,#f3f5f7_54%)] dark:bg-[linear-gradient(120deg,#12151b_46%,#1b232f_54%)] px-8 pt-10 pb-8 overflow-hidden">

          {/* Logo */}
          <div className="relative flex justify-center mb-9">
            <div className="absolute h-fit w-fit  bg-emerald-400/25 dark:bg-emerald-500/20 blur-3xl" />
            <img src="/images/logo-light.png" alt="Zyra" className="relative w-44 h-auto dark:hidden" />
            <img src="/images/logo-dark.png" alt="Zyra" className="relative hidden w-44 h-auto dark:block" />
          </div>

          {/* Connection error */}
          {connectionError && (
            <div className="flex items-start gap-2.5 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-800/40 text-rose-700 dark:text-rose-400 rounded-xl px-4 py-3 mb-5 text-[13px]">
              <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
              <p>{connectionError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit(handleAuth)}>

            {/* Fields box */}
            <div className="rounded-2xl border border-slate-200 dark:border-white/10 px-5 py-5 space-y-5">

              {/* Email */}
              <div>
                <label className="block text-[10px] font-semibold tracking-[0.15em] text-slate-400 dark:text-slate-500 uppercase mb-2">
                  Adresse e-mail
                </label>
                <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-700 focus-within:border-emerald-500 dark:focus-within:border-emerald-500 pb-2 transition-colors">
                  <Mail className="h-4 w-4 text-slate-400 dark:text-slate-500 flex-shrink-0" />
                  <input
                    type="email"
                    placeholder="exemple@domaine.com"
                    className="w-full bg-transparent outline-none text-[14px] text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
                    {...register('email', {
                      required: "L'adresse e-mail est requise",
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: "L'adresse e-mail est invalide",
                      },
                    })}
                  />
                </div>
                {errors.email && (
                  <p className="text-[11px] text-rose-500 flex items-center gap-1 mt-1.5">
                    <AlertCircle className="h-3 w-3" />
                    {errors.email.message as string}
                  </p>
                )}
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-[10px] font-semibold tracking-[0.15em] text-slate-400 dark:text-slate-500 uppercase">
                    Mot de passe
                  </label>
                  <button
                    type="button"
                    onClick={() => router.push('/auth/forgot-password')}
                    className="text-[11px] text-[#16A34A] hover:text-[#15803D] dark:text-[#22C55E] hover:underline font-semibold"
                  >
                    Oublié ?
                  </button>
                </div>
                <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-700 focus-within:border-emerald-500 dark:focus-within:border-emerald-500 pb-2 transition-colors">
                  <Lock className="h-4 w-4 text-slate-400 dark:text-slate-500 flex-shrink-0" />
                  <input
                    type="password"
                    placeholder="••••••••"
                    className="w-full bg-transparent outline-none text-[14px] text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
                    {...register('password', {
                      required: 'Le mot de passe est requis',
                      minLength: { value: 6, message: 'Le mot de passe doit contenir au moins 6 caractères' },
                    })}
                  />
                </div>
                {errors.password && (
                  <p className="text-[11px] text-rose-500 flex items-center gap-1 mt-1.5">
                    <AlertCircle className="h-3 w-3" />
                    {errors.password.message as string}
                  </p>
                )}
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="mt-6 w-full h-12 rounded-full bg-[#22C55E] hover:bg-[#16A34A] disabled:opacity-60 text-white text-[14px] font-bold transition-colors shadow-lg shadow-emerald-500/30 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Connexion…
                </span>
              ) : (
                <>
                  Se connecter
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <p className="text-center text-[11px] text-slate-400 dark:text-slate-600 mt-7">
            © {new Date().getFullYear()} Zyra · Tous droits réservés
          </p>
        </div>
      </div>
    </div>
  )
}
