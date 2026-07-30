'use client'

import { useForm, FieldValues } from 'react-hook-form'
import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import Image from 'next/image'
import Link from 'next/link'
import { Mail, Lock, ArrowRight, ArrowLeft, AlertCircle } from 'lucide-react'
import { ownerAuthService } from '@/services/ownerAuthService'
import { useSalon } from '@zyra/core/hooks/useSalon'
import { useRouter } from 'next/navigation'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { auth } from '@zyra/conf/lib/firebase'

export default function Login() {
  const { register, handleSubmit, formState: { errors } } = useForm()
  const [isLoading, setIsLoading] = useState(false)
  const [connectionError, setConnectionError] = useState('')
  const router = useRouter()
  const { switchSalon } = useSalon()

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
      const user = await ownerAuthService.login(data.email, data.password)
      const context = await ownerAuthService.getAccountContext(user.uid)

      if (context.type === 'owner') {
        if (typeof window !== 'undefined') localStorage.removeItem('salonId')
        toast.success('Connexion réussie')
        window.location.href = '/salon/setup'
        return
      }

      if (context.type === 'member') {
        if (context.member.status === 'suspended') {
          await signOut(auth)
          setConnectionError('Votre accès a été suspendu. Contactez le propriétaire du salon.')
          return
        }
        switchSalon(context.member.salonId)
        toast.success('Connexion réussie')
        window.location.href = context.member.mustChangePassword
          ? '/auth/change-password'
          : '/salon/dashboard'
        return
      }

      await signOut(auth)
      setConnectionError('Ce compte est introuvable. Contactez le support Zyra.')
    } catch (error: any) {
      setConnectionError(error.message || 'Une erreur est survenue. Vérifiez votre connexion internet.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex bg-white dark:bg-[#0B0E12]">

    

      {/* Right: image panel */}
      <div className="hidden lg:block lg:w-[54%] relative">
        <Image
          src="/images/register.jpg"
          alt="Une équipe de coiffeurs Zyra au travail"
          fill
          sizes="54vw"
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/0 to-black/5" />
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/15 via-transparent to-transparent" />
      </div>

        {/* Left: form panel */}
      <div className="w-full lg:w-[46%] flex flex-col px-6 sm:px-10 lg:px-16">

        <button
          type="button"
          onClick={() => router.back()}
          aria-label="Retour"
          className="mt-6 -ml-2 flex h-9 w-9 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800/70 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>

        <div className="flex-1 flex flex-col justify-center py-10">
          <div className="w-full max-w-[400px] mx-auto lg:mx-0">

            <img src="/images/full-logo-light.png" alt="Zyra" className="h-6 w-auto mb-10 dark:hidden" />
            <img src="/images/full-logo-dark.png" alt="Zyra" className="h-6 w-auto mb-10 hidden dark:block" />

            <h1 className="text-[26px] font-extrabold text-slate-900 dark:text-white tracking-tight mb-2">
              Zyra pour les professionnels
            </h1>
            <p className="text-[14px] text-slate-500 dark:text-slate-400 mb-8 leading-relaxed">
              Connectez-vous pour gérer votre salon, votre équipe et vos rendez-vous.
            </p>

            {connectionError && (
              <div className="flex items-start gap-2.5 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-800/40 text-rose-700 dark:text-rose-400 rounded-xl px-4 py-3 mb-5 text-[13px]">
                <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                <p>{connectionError}</p>
              </div>
            )}

            <form onSubmit={handleSubmit(handleAuth)} className="space-y-4">
              <div>
                <label className="block text-[13px] font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Adresse e-mail
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500" />
                  <input
                    type="email"
                    placeholder="exemple@domaine.com"
                    className="w-full h-12 pl-10 pr-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-[14px] text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none focus:border-emerald-500 dark:focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15 transition-colors"
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

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[13px] font-semibold text-slate-700 dark:text-slate-300">
                    Mot de passe
                  </label>
                  <button
                    type="button"
                    onClick={() => router.push('/auth/forgot-password')}
                    className="text-[12px] font-semibold text-emerald-600 dark:text-emerald-400 hover:underline underline-offset-2"
                  >
                    Oublié ?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500" />
                  <input
                    type="password"
                    placeholder="••••••••"
                    className="w-full h-12 pl-10 pr-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-[14px] text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none focus:border-emerald-500 dark:focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15 transition-colors"
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

              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 rounded-xl bg-[#22C55E] hover:bg-[#16A34A] disabled:opacity-60 text-white text-[14px] font-bold transition-colors shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 mt-2"
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

            <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 text-center">
              <p className="text-[13px] text-slate-500 dark:text-slate-400">
                Pas encore de salon sur Zyra ?{' '}
                <Link
                  href="/auth/register"
                  className="font-semibold text-emerald-600 dark:text-emerald-400 hover:underline underline-offset-2"
                >
                  Créer un compte
                </Link>
              </p>
            </div>
          </div>
        </div>

        <p className="text-center text-[11px] text-slate-400 dark:text-slate-600 pb-6">
          © {new Date().getFullYear()} Zyra · Tous droits réservés
        </p>
      </div>
    </div>
  )
}
