'use client'

import { useForm, FieldValues } from 'react-hook-form'
import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { Mail, Lock, ArrowRight, AlertCircle } from 'lucide-react'
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
    <div className="min-h-screen bg-white dark:bg-[#0B0E12] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-[400px]">

        {/* Logo */}
        <div className="flex justify-center mb-6">
          <img
            src="/logo.jpg"
            alt="Zyra"
            className="h-5xl w-5xl object-contain rounded-2xl"
          />
        </div>

        {/* Card */}
        <div className="bg-white dark:bg-[#12161C] border border-gray-200 dark:border-slate-800/60 rounded-2xl p-8 shadow-[0_2px_20px_rgba(0,0,0,0.05)]">

          {/* Header */}
          <div className="mb-7">
            <h1 className="text-[20px] font-extrabold text-gray-900 dark:text-white tracking-tight">Connexion</h1>
            <p className="text-[13px] text-gray-500 dark:text-slate-400 mt-1">
              Accédez à votre tableau de bord
            </p>
          </div>

          {/* Connection error */}
          {connectionError && (
            <div className="flex items-start gap-2.5 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-800/40 text-rose-700 dark:text-rose-400 rounded-xl px-4 py-3 mb-5 text-[13px]">
              <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
              <p>{connectionError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit(handleAuth)} className="space-y-4">

            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-[12px] font-semibold text-gray-600 dark:text-slate-400 uppercase tracking-wider">
                Adresse e-mail
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-slate-500" />
                <input
                  type="email"
                  placeholder="exemple@domaine.com"
                  className={`w-full h-11 pl-10 pr-4 text-[14px] rounded-xl border bg-gray-50 dark:bg-slate-800/50 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-500 outline-none transition-all focus:ring-2 focus:ring-[#22C55E]/30 focus:border-[#22C55E] ${
                    errors.email
                      ? 'border-rose-300 dark:border-rose-700'
                      : 'border-gray-200 dark:border-slate-700'
                  }`}
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
                <p className="text-[11px] text-rose-500 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.email.message as string}
                </p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[12px] font-semibold text-gray-600 dark:text-slate-400 uppercase tracking-wider">
                  Mot de passe
                </label>
                <button
                  type="button"
                  onClick={() => router.push('/auth/forgot-password')}
                  className="text-[12px] text-[#16A34A] hover:text-[#15803D] dark:text-[#22C55E] hover:underline font-semibold"
                >
                  Oublié ?
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-slate-500" />
                <input
                  type="password"
                  placeholder="••••••••"
                  className={`w-full h-11 pl-10 pr-4 text-[14px] rounded-xl border bg-gray-50 dark:bg-slate-800/50 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-500 outline-none transition-all focus:ring-2 focus:ring-[#22C55E]/30 focus:border-[#22C55E] ${
                    errors.password
                      ? 'border-rose-300 dark:border-rose-700'
                      : 'border-gray-200 dark:border-slate-700'
                  }`}
                  {...register('password', {
                    required: 'Le mot de passe est requis',
                    minLength: { value: 6, message: 'Le mot de passe doit contenir au moins 6 caractères' },
                  })}
                />
              </div>
              {errors.password && (
                <p className="text-[11px] text-rose-500 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.password.message as string}
                </p>
              )}
            </div>

            {/* Submit */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-11 rounded-xl bg-[#22C55E] hover:bg-[#16A34A] disabled:opacity-60 text-white text-[14px] font-bold transition-colors shadow-md shadow-[#22C55E]/25 flex items-center justify-center gap-2"
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
            </div>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-[11px] text-gray-400 dark:text-slate-600 mt-6">
          © {new Date().getFullYear()} Zyra · Tous droits réservés
        </p>
      </div>
    </div>
  )
}
