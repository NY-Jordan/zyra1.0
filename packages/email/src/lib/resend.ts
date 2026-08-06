import { Resend } from 'resend'
import { ReactElement } from 'react'

// Lazy-initialized: the Resend constructor throws synchronously when the API
// key is missing, which would crash this module at import time (and every
// route that imports @zyra/email) instead of failing inside sendEmail() where
// callers can catch it.
let resendClient: Resend | null = null

function getResendClient() {
  if (!resendClient) {
    if (!process.env.RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY manquante — ajoutez-la aux variables d\'environnement.')
    }
    resendClient = new Resend(process.env.RESEND_API_KEY)
  }
  return resendClient
}

// En dev : utilise l'adresse de test Resend (aucun domaine requis)
// En prod : remplace par 'Zyraa <noreply@ton-domaine.com>' après vérification DNS sur resend.com
export const FROM_ADDRESS = process.env.EMAIL_FROM ?? 'onboarding@resend.dev'

export interface SendEmailOptions {
  to: string | string[]
  subject: string
  react: ReactElement
}

export async function sendEmail({ to, subject, react }: SendEmailOptions) {
  const { data, error } = await getResendClient().emails.send({
    from: FROM_ADDRESS,
    to,
    subject,
    react,
  })

  if (error) throw new Error(error.message)
  return data
}
