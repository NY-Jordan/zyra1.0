'use client'
import { Button } from '@zyra/ui/components/button'
import { LoadingSpinner } from '@/presentation/components/LoadingSpinner'
import { useForm, FieldValues } from "react-hook-form"
import { toast } from 'sonner'
import { isBlocked, LoginByEmail, recordAttempt } from '@/services/AuthService'
import { StatusCodeEnum } from '@zyra/conf/domain/enums/StatusCodeEnum'
import { formatCountdown } from '@zyra/conf/lib/utils'
import PublicLayout from '@/presentation/layouts/PublicLayout'
import { editDocument } from '@zyra/conf/lib/query'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

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
     <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form
        onSubmit={handleSubmit(handleLogin)}
        className="bg-white p-8 rounded-lg shadow-md w-full max-w-sm flex flex-col gap-4"
      >
        <h1 className="text-2xl font-bold mb-4 text-center">Connexion</h1>
        <label className="text-sm font-medium">Email</label>
        <input
          type="email"
          className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Entrez votre email"
          {...register("email", { required: true })}
          disabled={!!isBlockedNow}
        />

        <Button variant={'default'} disabled={loading || !!isBlockedNow}>
          {loading ? <LoadingSpinner className="h-5 w-5" /> : "Continuer"}
        </Button>
        {isBlockedNow && (
          <div className="text-red-500 text-xs text-center mt-2">
            Trop de tentatives. Réessayez dans {formatCountdown(countdown)}.
          </div>
        )}
      </form>
    </div>
   </PublicLayout>
  )
}
