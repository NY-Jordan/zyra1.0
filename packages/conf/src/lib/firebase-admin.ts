import { getApps, initializeApp, cert, App } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'

// Le SDK client (`./firebase.ts`) est connecté en dur à l'émulateur Auth
// (127.0.0.1:9099). Le SDK Admin doit cibler le même émulateur, sinon les
// comptes créés côté serveur (adminAuth().createUser, ...) atterrissent dans
// le vrai projet Firebase de production et deviennent introuvables au login
// (qui interroge l'émulateur via le SDK client).
if (!process.env.FIREBASE_AUTH_EMULATOR_HOST) {
  process.env.FIREBASE_AUTH_EMULATOR_HOST = '127.0.0.1:9099'
}

function getAdminApp(): App {
  if (getApps().length > 0) return getApps()[0]!

  return initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
      // La clé privée Firebase contient des \n littéraux dans les env vars
      privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  })
}

export const adminAuth = () => getAuth(getAdminApp())
