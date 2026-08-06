import { NextRequest, NextResponse } from 'next/server'
import { ContactFormEmail, sendEmail } from '@zyra/email'

const CONTACT_INBOX = 'ynguetse@gmail.com'

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null)
  const name = typeof body?.name === 'string' ? body.name.trim() : ''
  const email = typeof body?.email === 'string' ? body.email.trim() : ''
  const phone = typeof body?.phone === 'string' ? body.phone.trim() : undefined
  const message = typeof body?.message === 'string' ? body.message.trim() : ''

  if (!name || !email || !message) {
    return NextResponse.json({ ok: false, error: 'Champs requis manquants.' }, { status: 400 })
  }

  try {
    await sendEmail({
      to: CONTACT_INBOX,
      subject: `Nouveau message de contact — ${name}`,
      react: ContactFormEmail({ name, email, phone, message }),
    })
    return NextResponse.json({ ok: true })
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error.message || 'Envoi impossible.' }, { status: 500 })
  }
}
