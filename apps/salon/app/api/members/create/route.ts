import { NextRequest, NextResponse } from 'next/server'
import React from 'react'
import { adminAuth } from '@zyra/conf/lib/firebase-admin'
import { createDocument } from '@zyra/conf/lib/query'
import { generatePassword } from '@zyra/conf/lib/utils'
import { getRole, RoleId } from '@zyra/conf/domain/entities/permissions.entities'
import { MemberInvitationEmail, sendEmail } from '@zyra/email'

export async function POST(req: NextRequest) {
  try {
    const { salonId, salonName, name, email, roleId, sendCredentials } = await req.json()

    if (!salonId || !name || !email || !roleId) {
      return NextResponse.json({ error: 'Champs manquants' }, { status: 400 })
    }
    if (roleId === 'owner' || roleId === 'hairdresser') {
      return NextResponse.json(
        { error: 'Ce rôle ne peut pas être assigné depuis ce formulaire.' },
        { status: 400 }
      )
    }

    const password = generatePassword()
    const userRecord = await adminAuth().createUser({ email, password, displayName: name })
    const uid = userRecord.uid

    await createDocument(
      'salon_members',
      {
        salonId,
        uid,
        name,
        email,
        roleId: roleId as RoleId,
        status: 'active',
        mustChangePassword: true,
        addedAt: new Date().toISOString().slice(0, 10),
      },
      uid
    )

    if (sendCredentials) {
      const loginUrl = process.env.NEXT_PUBLIC_SALON_URL
        ? `${process.env.NEXT_PUBLIC_SALON_URL}/auth/login`
        : 'https://app.zyra.app/auth/login'

      await sendEmail({
        to: "ynguetse@gmail.com",
        subject: `Vous avez été ajouté(e) à l'équipe de ${salonName || 'votre salon'} sur Zyraa`,
        react: React.createElement(MemberInvitationEmail, {
          memberName: name,
          salonName: salonName || 'votre salon',
          roleLabel: getRole(roleId as RoleId).label,
          email,
          password,
          loginUrl,
        }),
      })
    }

    return NextResponse.json({ id: uid, password })
  } catch (err: any) {
    console.error('[members/create]', err)
    return NextResponse.json({ error: err.message ?? 'Erreur lors de la création du membre' }, { status: 500 })
  }
}
