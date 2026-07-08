'use client'
import { useState } from 'react'
import { useForm, FieldValues } from 'react-hook-form'
import Link from 'next/link'
import { Mail, ArrowLeft, ArrowRight, CheckCircle2, AlertCircle, Sparkle } from 'lucide-react'

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
    <div className="relative min-h-screen flex items-center justify-center px-4 py-12 overflow-hidden bg-gradient-to-br from-slate-100 via-white to-slate-100 dark:from-[#080A0E] dark:via-[#0B0E12] dark:to-[#0F1319]">

      {/* Dot grid texture */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.5] dark:opacity-[0.35] [background-image:radial-gradient(circle,_rgba(100,116,139,0.35)_1px,_transparent_1px)] dark:[background-image:radial-gradient(circle,_rgba(148,163,184,0.5)_1px,_transparent_1px)] [background-size:26px_26px]" />

      {/* Ambient glow blobs */}
      <div className="pointer-events-none absolute -top-40 -left-32 h-96 w-96 rounded-full bg-emerald-400/25 dark:bg-emerald-500/30 blur-[110px]" />
      <div className="pointer-events-none absolute -bottom-40 -right-32 h-96 w-96 rounded-full bg-emerald-300/25 dark:bg-emerald-400/25 blur-[110px]" />
      <div className="pointer-events-none absolute top-1/3 right-0 h-72 w-72 rounded-full bg-sky-300/15 dark:bg-sky-500/25 blur-[110px]" />

      {/* Radial vignette to keep focus on the card */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_35%,_rgba(255,255,255,0.6)_100%)] dark:bg-[radial-gradient(ellipse_at_center,_transparent_35%,_rgba(3,5,8,0.5)_100%)]" />

      <Sparkle className="hidden sm:block fixed bottom-8 right-10 h-8 w-8 text-slate-300 dark:text-slate-700/80" />
      <Sparkle className="hidden sm:block fixed top-10 left-10 h-5 w-5 text-slate-300/80 dark:text-slate-700/60" />

      <div className="relative w-full max-w-[420px]">

        {/* Card */}
        <div className="relative rounded-[28px] border border-slate-200 dark:border-white/5 shadow-[0_8px_40px_rgba(0,0,0,0.06)] dark:shadow-[0_25px_70px_rgba(0,0,0,0.55)] bg-[linear-gradient(120deg,#ffffff_46%,#f3f5f7_54%)] dark:bg-[linear-gradient(120deg,#12151b_46%,#1b232f_54%)] px-8 pt-10 pb-8 overflow-hidden">

          {/* Logo */}
          <div className="relative flex justify-center mb-9">
            <div className="absolute h-24 w-44 rounded-full bg-emerald-400/25 dark:bg-emerald-500/20 blur-3xl" />
            <img src="/images/logo-light.png" alt="Zyra" className="relative w-44 h-auto dark:hidden" />
            <img src="/images/logo-dark.png" alt="Zyra" className="relative hidden w-44 h-auto dark:block" />
          </div>

          {status === 'sent' ? (
            /* ── Success state ─────────────────────────────────────────────── */
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <div className="h-14 w-14 rounded-full bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 flex items-center justify-center">
                  <CheckCircle2 className="h-7 w-7 text-emerald-500" />
                </div>
              </div>
              <h2 className="text-[17px] font-bold text-slate-800 dark:text-white mb-2">
                E-mail envoyé !
              </h2>
              <p className="text-[13px] text-slate-500 dark:text-slate-400 leading-relaxed mb-5">
                Si un compte Zyra est associé à{' '}
                <span className="font-semibold text-slate-700 dark:text-slate-200">{sentEmail}</span>,
                vous recevrez un lien de réinitialisation dans quelques instants.
              </p>

              <div className="rounded-2xl border border-slate-200 dark:border-white/10 px-5 py-4 text-left mb-6">
                <p className="text-[10px] font-semibold tracking-[0.15em] text-slate-400 dark:text-slate-500 uppercase mb-2">
                  Vous ne voyez pas l'e-mail ?
                </p>
                <ul className="text-[12px] text-slate-500 dark:text-slate-400 space-y-1 list-disc list-inside">
                  <li>Vérifiez votre dossier spam ou courrier indésirable</li>
                  <li>Le lien est valable pendant 1 heure</li>
                  <li>Vérifiez que l'adresse saisie est correcte</li>
                </ul>
              </div>

              <button
                onClick={() => setStatus('idle')}
                className="w-full h-12 rounded-full bg-[#22C55E] hover:bg-[#16A34A] text-white text-[14px] font-bold transition-colors shadow-lg shadow-emerald-500/30 flex items-center justify-center gap-2"
              >
                Renvoyer l'e-mail
              </button>

              <Link
                href="/auth/login"
                className="mt-5 inline-flex items-center justify-center gap-1.5 text-[12px] font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Retour à la connexion
              </Link>
            </div>
          ) : (
            /* ── Form state ────────────────────────────────────────────────── */
            <>
              <div className="text-center mb-7">
                <h2 className="text-[17px] font-bold text-slate-800 dark:text-white mb-2">
                  Mot de passe oublié ?
                </h2>
                <p className="text-[13px] text-slate-500 dark:text-slate-400 leading-relaxed">
                  Saisissez l'adresse e-mail associée à votre compte.<br />
                  Nous vous enverrons un lien pour le réinitialiser.
                </p>
              </div>

              {/* Error */}
              {status === 'error' && (
                <div className="flex items-start gap-2.5 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-800/40 text-rose-700 dark:text-rose-400 rounded-xl px-4 py-3 mb-5 text-[13px]">
                  <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                  <p>{errorMessage}</p>
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)}>

                {/* Field box */}
                <div className="rounded-2xl border border-slate-200 dark:border-white/10 px-5 py-5">
                  <label className="block text-[10px] font-semibold tracking-[0.15em] text-slate-400 dark:text-slate-500 uppercase mb-2">
                    Adresse e-mail
                  </label>
                  <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-700 focus-within:border-emerald-500 dark:focus-within:border-emerald-500 pb-2 transition-colors">
                    <Mail className="h-4 w-4 text-slate-400 dark:text-slate-500 flex-shrink-0" />
                    <input
                      type="email"
                      placeholder="exemple@domaine.com"
                      disabled={status === 'loading'}
                      className="w-full bg-transparent outline-none text-[14px] text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
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
                    <p className="text-[11px] text-rose-500 flex items-center gap-1 mt-1.5">
                      <AlertCircle className="h-3 w-3" />
                      {errors.email.message as string}
                    </p>
                  )}
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="mt-6 w-full h-12 rounded-full bg-[#22C55E] hover:bg-[#16A34A] disabled:opacity-60 text-white text-[14px] font-bold transition-colors shadow-lg shadow-emerald-500/30 flex items-center justify-center gap-2"
                >
                  {status === 'loading' ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Envoi en cours…
                    </span>
                  ) : (
                    <>
                      Envoyer le lien
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </form>

              <div className="mt-6 text-center">
                <Link
                  href="/auth/login"
                  className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Retour à la connexion
                </Link>
              </div>
            </>
          )}

          {/* Footer */}
          <p className="text-center text-[11px] text-slate-400 dark:text-slate-600 mt-7">
            © {new Date().getFullYear()} Zyra · Tous droits réservés
          </p>
        </div>
      </div>
    </div>
  )
}
