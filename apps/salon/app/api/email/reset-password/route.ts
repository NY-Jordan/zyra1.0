import { NextRequest, NextResponse } from 'next/server'
import { PasswordResetEmail, sendEmail } from '@zyra/email'
import { adminAuth } from '@zyra/conf/lib/firebase-admin'
import React from 'react'

export async function POST(req: NextRequest) {
  console.log('[reset-password] route appelée')
  try {
    const { email } = await req.json()
    console.log('[reset-password] email reçu:', email)
    if (!email) {
      return NextResponse.json({ error: 'Email manquant' }, { status: 400 })
    }

    // Vérifie d'abord que l'utilisateur existe bien dans Firebase Auth
    const user = await adminAuth().getUserByEmail(email)
    console.log('[reset-password] utilisateur trouvé:', user.uid, user.email)

    // Génère le lien de réinitialisation via Firebase Admin
    const resetLink = await adminAuth().generatePasswordResetLink(email, {
      url: process.env.NEXT_PUBLIC_SALON_URL
        ? `${process.env.NEXT_PUBLIC_SALON_URL}/auth/login`
        : 'https://app.zyra.app/auth/login',
    })
    console.log('[reset-password] lien généré:', resetLink)

    await sendEmail({
      to: 'ynguetse@gmail.com',
      subject: 'Réinitialisation de votre mot de passe Zyraa',
      react: React.createElement(PasswordResetEmail, { resetLink }),
    })

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('[reset-password] erreur:', err)
    // MODE DEBUG — à remettre en { success: true } après résolution
    return NextResponse.json({
      ok: false,
      error: err.message,
      code: err.code ?? null,
    }, { status: 500 })
  }
}
