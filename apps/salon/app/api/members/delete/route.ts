import { NextRequest, NextResponse } from 'next/server'
import { adminAuth } from '@zyra/conf/lib/firebase-admin'
import { deleteDocument } from '@zyra/conf/lib/query'
import { SALON_MEMBERS_COLLECTION } from '@zyra/conf/domain/entities/permissions.entities'

export async function POST(req: NextRequest) {
  try {
    const { uid } = await req.json()

    if (!uid) {
      return NextResponse.json({ error: 'uid manquant' }, { status: 400 })
    }

    try {
      await adminAuth().deleteUser(uid)
    } catch (err: any) {
      // Le compte Auth peut déjà avoir été supprimé manuellement : on ne bloque
      // pas le nettoyage du doc Firestore pour autant.
      if (err.code !== 'auth/user-not-found') throw err
    }

    await deleteDocument(SALON_MEMBERS_COLLECTION, uid)

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('[members/delete]', err)
    return NextResponse.json({ error: err.message ?? 'Erreur lors de la suppression du membre' }, { status: 500 })
  }
}
