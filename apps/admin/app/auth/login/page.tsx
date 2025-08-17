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

export default function Login() {
  const [loading, setLoading] = useState(false)
  const [blockedUntil, setBlockedUntil] = useState<number | null>(null)
  const [countdown, setCountdown] = useState<number>(0)
  const { register, handleSubmit, formState: { errors } } = useForm()
  const [now] = useState(() => Date.now());
  const isBlockedNow = blockedUntil && now < blockedUntil
  // handle countdown for blocked state
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
  }, [blockedUntil]);


  const handleLogin = async (data: FieldValues) => {
    setLoading(true)
    // verifie server side if the email is blocked
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
    // after record attempt, check if the email is blocked again
    const afterBlockInfo = await isBlocked(data.email)
    if (afterBlockInfo.blocked) {
      setBlockedUntil(afterBlockInfo.blockedUntil!)
    toast.error("Trop de tentatives. Veuillez patienter 5 minutes avant de réessayer.")
      return
    }

    if (result === StatusCodeEnum.OK) {
      localStorage.setItem('emailForSignIn', data.email)
      toast.success('Un email a été envoyé à votre adresse. Vérifiez votre boîte de réception pour continuer.')
      return
    }
    if (result === StatusCodeEnum.NOT_FOUND) {
      toast.error('Aucun utilisateur trouvé avec cet email. Veuillez vérifier votre saisie.')
      return
    }
    toast.error('Une erreur est survenue. Veuillez réessayer plus tard.')
  }


  return (
    <PublicLayout>
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-950 px-4">
        {/* Logo section */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white font-bold text-2xl mb-6 shadow-2xl shadow-indigo-500/25 ring-4 ring-white/20">
            ZA
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
            Zyra Admin
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-3 font-medium">
            Connectez-vous à votre espace d'administration
          </p>
        </div>

        {/* Form Container */}
        <div className="w-full max-w-sm">
          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl shadow-2xl shadow-slate-900/10 dark:shadow-black/40 border border-white/20 dark:border-slate-700/50 p-8">
            <form
              onSubmit={handleSubmit(handleLogin)}
              className="space-y-6"
            >
              <div className="space-y-3">
                <label htmlFor="email" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Adresse e-mail
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="vous@exemple.com"
                  className="w-full h-12 text-base bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600 focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-indigo-500 dark:focus:ring-indigo-400"
                  {...register("email", { required: true })}
                  disabled={!!isBlockedNow}
                />
                {errors?.email && (
                  <p className="text-xs text-red-500 dark:text-red-400 font-medium">L'adresse e-mail est requise</p>
                )}
              </div>

              {isBlockedNow && (
                <div className="rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/50 text-red-700 dark:text-red-300 text-sm px-4 py-4 backdrop-blur-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                    <span>Trop de tentatives. Réessayez dans <span className="font-semibold">{formatCountdown(countdown)}</span></span>
                  </div>
                </div>
              )}

              <Button 
                type="submit"
                className="w-full h-12 text-base font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg shadow-indigo-500/25 transition-all duration-200 transform hover:scale-[1.02]"
                disabled={loading || !!isBlockedNow}
              >
                {loading ? (
                  <div className="flex items-center gap-3">
                    <LoadingSpinner className="h-5 w-5" />
                    <span>Connexion en cours...</span>
                  </div>
                ) : (
                  "Se connecter"
                )}
              </Button>
            </form>
          </div>

          <div className="mt-8 text-center">
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm leading-relaxed">
              En vous connectant, vous acceptez nos{" "}
              <span className="text-indigo-600 dark:text-indigo-400 underline cursor-pointer hover:text-indigo-700 dark:hover:text-indigo-300">
                conditions d'utilisation
              </span>{" "}
              et notre{" "}
              <span className="text-indigo-600 dark:text-indigo-400 underline cursor-pointer hover:text-indigo-700 dark:hover:text-indigo-300">
                politique de confidentialité
              </span>.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center">
          <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">
            © {new Date().getFullYear()} Zyra. Tous droits réservés.
          </p>
        </div>
      </div>
    </PublicLayout>
  )
}
