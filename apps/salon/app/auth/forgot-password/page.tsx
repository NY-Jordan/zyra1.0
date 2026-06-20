'use client'
import { useState } from 'react'
import { useForm, FieldValues } from 'react-hook-form'
import { Input } from '@zyra/ui/components/input'
import { Button } from '@zyra/ui/components/button'
import Image from 'next/image'
import Link from 'next/link'
import { Mail, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react'

export default function ForgotPassword() {
  const { register, handleSubmit, formState: { errors }, watch } = useForm()
  const [status, setStatus] = useState<'idle' | 'loading' | 'sent' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const sentEmail = watch('email')

  const onSubmit = async (data: FieldValues) => {
    setStatus('loading')
    setErrorMessage('')
    try {
      const res = await fetch('/api/email/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: data.email }),
      })
      if (!res.ok) {
        const json = await res.json().catch(() => ({}))
        // On affiche quand même le succès sauf erreur de validation email
        if (json?.error?.includes('invalid')) {
          setErrorMessage("L'adresse e-mail saisie n'est pas valide.")
          setStatus('error')
          return
        }
      }
      setStatus('sent')
    } catch {
      // Réseau HS : on affiche quand même le succès (sécurité)
      setStatus('sent')
    }
  }

  return (
    <div className="min-h-screen flex bg-zinc-100 dark:bg-slate-950">

      {/* ── Left branding ──────────────────────────────────────────────────── */}
      <div className="hidden lg:block lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/images/salon-background.jpg"
            alt="Salon de beauté"
            fill
            sizes="50vw"
            priority
            className="object-cover"
          />
          <div className="absolute inset-0 bg-zinc-900/70 backdrop-blur-sm" />
        </div>
        <div className="relative h-full flex flex-col justify-between text-white z-10">
          <div className="p-12">
            <div className="text-2xl font-bold text-white">Zyra</div>
          </div>
          <div className="p-12 space-y-5">
            <h1 className="text-4xl font-bold leading-tight">
              Récupérez l'accès à votre compte.
            </h1>
            <p className="text-lg text-zinc-200">
              Un e-mail de réinitialisation vous sera envoyé en quelques secondes.
            </p>
            <div className="pt-6 space-y-3">
              {[
                'Sécurisé et chiffré',
                'Lien valable 1 heure',
                'Aucune donnée partagée',
              ].map(item => (
                <div key={item} className="flex items-center gap-3">
                  <div className="bg-zinc-800/80 p-2 rounded-full flex-shrink-0">
                    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-zinc-100">{item}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="p-12">
            <p className="text-sm text-zinc-300">
              © {new Date().getFullYear()} Zyra. Tous droits réservés.
            </p>
          </div>
        </div>
      </div>

      {/* ── Right form ─────────────────────────────────────────────────────── */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-12 bg-white dark:bg-slate-900">
        <div className="w-full max-w-md">

          {status === 'sent' ? (
            /* ── Success state ─────────────────────────────────────────────── */
            <div className="text-center space-y-5">
              <div className="flex justify-center">
                <div className="w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                </div>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-zinc-800 dark:text-white mb-2">
                  E-mail envoyé !
                </h2>
                <p className="text-zinc-500 dark:text-slate-400 text-sm leading-relaxed">
                  Si un compte Zyra est associé à{' '}
                  <span className="font-semibold text-zinc-700 dark:text-slate-200">{sentEmail}</span>,
                  vous recevrez un lien de réinitialisation dans quelques instants.
                </p>
              </div>
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 rounded-xl px-4 py-3 text-left">
                <p className="text-[12px] font-semibold text-amber-800 dark:text-amber-300 mb-1">
                  Vous ne voyez pas l'e-mail ?
                </p>
                <ul className="text-[11px] text-amber-700 dark:text-amber-400 space-y-1 list-disc list-inside">
                  <li>Vérifiez votre dossier spam ou courrier indésirable</li>
                  <li>Le lien est valable pendant 1 heure</li>
                  <li>Vérifiez que l'adresse saisie est correcte</li>
                </ul>
              </div>
              <div className="flex flex-col gap-2 pt-2">
                <button
                  onClick={() => setStatus('idle')}
                  className="text-sm text-zinc-500 dark:text-slate-400 hover:text-zinc-700 dark:hover:text-slate-200 underline underline-offset-2 transition-colors"
                >
                  Renvoyer l'e-mail
                </button>
                <Link
                  href="/auth/login"
                  className="inline-flex items-center justify-center gap-2 text-sm font-medium text-zinc-700 dark:text-slate-300 hover:text-zinc-900 dark:hover:text-white transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Retour à la connexion
                </Link>
              </div>
            </div>
          ) : (
            /* ── Form state ────────────────────────────────────────────────── */
            <>
              <div className="text-center mb-8">
                <div className="mb-3 flex justify-center">
                  <div className="h-12 w-12 rounded-full bg-zinc-800 dark:bg-slate-700 flex items-center justify-center text-white">
                    <Mail size={22} />
                  </div>
                </div>
                <h2 className="text-2xl font-bold text-zinc-800 dark:text-white">
                  Mot de passe oublié ?
                </h2>
                <p className="text-zinc-500 dark:text-slate-400 mt-2 text-sm leading-relaxed">
                  Saisissez l'adresse e-mail associée à votre compte.<br />
                  Nous vous enverrons un lien pour le réinitialiser.
                </p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

                {status === 'error' && (
                  <div className="flex items-start gap-2.5 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 rounded-xl px-4 py-3">
                    <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                    <p className="text-[13px] text-red-700 dark:text-red-400">{errorMessage}</p>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label htmlFor="email" className="text-sm font-medium text-zinc-700 dark:text-slate-300">
                    Adresse e-mail
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-slate-500 h-5 w-5" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="exemple@domaine.com"
                      disabled={status === 'loading'}
                      className="pl-10 py-5 bg-white dark:bg-slate-800 border-zinc-300 dark:border-slate-600 text-zinc-800 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-slate-500 focus-visible:ring-zinc-400 focus-visible:border-zinc-400"
                      {...register('email', {
                        required: "L'adresse e-mail est requise",
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: "L'adresse e-mail n'est pas valide",
                        },
                      })}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-xs text-red-500">{errors.email.message as string}</p>
                  )}
                </div>

                <Button
                  type="submit"
                  disabled={status === 'loading'}
                  className="w-full py-6 bg-zinc-800 hover:bg-zinc-700 dark:bg-slate-700 dark:hover:bg-slate-600 text-white"
                >
                  {status === 'loading' ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      Envoi en cours…
                    </span>
                  ) : (
                    'Envoyer le lien de réinitialisation'
                  )}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <Link
                  href="/auth/login"
                  className="inline-flex items-center gap-1.5 text-sm text-zinc-500 dark:text-slate-400 hover:text-zinc-800 dark:hover:text-white transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Retour à la connexion
                </Link>
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  )
}
