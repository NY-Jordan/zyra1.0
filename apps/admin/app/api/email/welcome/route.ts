import { NextRequest, NextResponse } from 'next/server'
import { WelcomeEmail, sendEmail } from '@zyra/email'
import React from 'react'

export async function POST(req: NextRequest) {
  try {
    const { ownerName, salonName, email, password } = await req.json()

    if (!ownerName || !salonName || !email || !password) {
      return NextResponse.json({ error: 'Champs manquants' }, { status: 400 })
    }

    const loginUrl = process.env.NEXT_PUBLIC_SALON_URL
      ? `${process.env.NEXT_PUBLIC_SALON_URL}/auth/login`
      : 'https://app.zyra.app/auth/login'

    await sendEmail({
      to: email,
      subject: `Bienvenue sur Zyraa — votre salon "${salonName}" est prêt !`,
      react: React.createElement(WelcomeEmail, { ownerName, salonName, email, password, loginUrl }),
    })

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('[email/welcome]', err)
    return NextResponse.json({ error: err.message ?? 'Erreur envoi email' }, { status: 500 })
  }
}
