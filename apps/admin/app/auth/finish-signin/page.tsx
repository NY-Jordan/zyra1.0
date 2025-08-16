'use client'
import React, { useEffect, useState } from 'react'
import { isSignInWithEmailLink, signInWithEmailLink } from 'firebase/auth'
import { auth, db } from '@zyra/conf/lib/firebase'
import { toast } from 'sonner'
import { LoadingSpinner } from '@/presentation/components/LoadingSpinner'
import { editDocument, fetchCollection } from '@zyra/conf/lib/query'
import { where } from 'firebase/firestore'
import { UserTypeEnum } from '@zyra/conf/domain/enums/UserTypeEnum'
import PublicLayout from '@/presentation/layouts/PublicLayout'
import { useRouter } from 'next/navigation'

export default function FinishSignin() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const finishSignIn = async () => {
      try {
        // Récupère l'email depuis le localStorage (stocké lors de la demande de lien)
        const email = window.localStorage.getItem('emailForSignIn')
        if (!email) {
          toast.error("Aucun email trouvé. Veuillez recommencer la connexion.")
          router.replace('/auth/login')
          return
        }

        // Vérifie que l'utilisateur existe et a le rôle admin
        const users = await fetchCollection("users", [
          where('email', '==', email),
          where('role.name', '==', UserTypeEnum.ADMIN),
        ])
        if (!users.length) {
          toast.error("Aucun administrateur trouvé avec cet email.")
          router.replace('/auth/login')
          return
        }

        if (isSignInWithEmailLink(auth, window.location.href)) {
          await signInWithEmailLink(auth, email, window.location.href)
          window.localStorage.removeItem('emailForSignIn')
          toast.success("Connexion réussie !")
          editDocument("login_attempts", email, { attempts: 0, blockedUntil: null })
          router.push('/')
          return
        } else {
          toast.error("Lien de connexion invalide ou expiré.")
          router.push('/auth/login')
        }
      } catch (error: any) {
        toast.error("Erreur lors de la finalisation de la connexion.")
        router.push('/auth/login')
      } finally {
        setLoading(false)
      }
    }
    finishSignIn()
  }, [router])

  if (loading) {
    return (
      <PublicLayout>
        <div className="flex items-center justify-center h-screen w-full">
        <LoadingSpinner className="h-8 w-8" />
      </div>
      </PublicLayout>
    )
  }

  return null
}
