import { Resend } from 'resend'
import { ReactElement } from 'react'

const resend = new Resend(process.env.RESEND_API_KEY)

// En dev : utilise l'adresse de test Resend (aucun domaine requis)
// En prod : remplace par 'Zyra <noreply@ton-domaine.com>' après vérification DNS sur resend.com
export const FROM_ADDRESS = process.env.EMAIL_FROM ?? 'onboarding@resend.dev'

export interface SendEmailOptions {
  to: string | string[]
  subject: string
  react: ReactElement
}

export async function sendEmail({ to, subject, react }: SendEmailOptions) {
  const { data, error } = await resend.emails.send({
    from: FROM_ADDRESS,
    to,
    subject,
    react,
  })

  if (error) throw new Error(error.message)
  return data
}
