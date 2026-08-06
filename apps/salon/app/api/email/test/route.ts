import { NextResponse } from 'next/server'
import { Resend } from 'resend'

// Route de diagnostic — à supprimer après les tests
export async function GET() {
  try {
    const resend = new Resend(process.env.RESEND_API_KEY)

    const { data, error } = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: 'ynguetse@gmail.com',
      subject: '✅ Test Resend — Zyraa fonctionne',
      html: '<h1>Test OK</h1><p>Resend est bien configuré sur Zyraa.</p>',
    })

    if (error) {
      return NextResponse.json({ ok: false, error }, { status: 500 })
    }

    return NextResponse.json({ ok: true, data })
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 })
  }
}
