import { NextRequest, NextResponse } from 'next/server'
import { AdminLoginEmail, sendEmail } from '@zyra/email'
import React from 'react'

// L'email de réception des notifications admin (à configurer dans .env)
const ADMIN_NOTIFY_EMAIL = process.env.ADMIN_NOTIFY_EMAIL ?? process.env.NEXT_PUBLIC_ADMIN_EMAIL

export async function POST(req: NextRequest) {
  try {
    if (!ADMIN_NOTIFY_EMAIL) {
      return NextResponse.json({ error: 'ADMIN_NOTIFY_EMAIL non configuré' }, { status: 500 })
    }

    const { adminEmail } = await req.json()
    if (!adminEmail) {
      return NextResponse.json({ error: 'adminEmail manquant' }, { status: 400 })
    }

    const ip = req.headers.get('x-forwarded-for')
      ?? req.headers.get('x-real-ip')
      ?? 'Inconnue'
    const userAgent = req.headers.get('user-agent') ?? undefined

    const loginAt = new Intl.DateTimeFormat('fr-FR', {
      dateStyle: 'full',
      timeStyle: 'short',
      timeZone: 'Africa/Douala',
    }).format(new Date())

    await sendEmail({
      to: ADMIN_NOTIFY_EMAIL,
      subject: `🔐 Connexion admin Zyra — ${loginAt}`,
      react: React.createElement(AdminLoginEmail, {
        adminEmail,
        loginAt,
        ipAddress: ip,
        userAgent,
      }),
    })

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('[email/admin-login]', err)
    return NextResponse.json({ error: err.message ?? 'Erreur envoi email' }, { status: 500 })
  }
}
