import { signInWithEmailAndPassword, signOut, updatePassword } from 'firebase/auth';
import { where } from 'firebase/firestore';

import type { ISalonMember } from '@zyra/conf/domain/entities/permissions.entities';

import { auth } from '@/lib/firebase';
import { editDocument, fetchCollection, getDocument } from '@/lib/query';

export type AccountContext =
  | { type: 'owner' }
  | { type: 'member'; member: ISalonMember }
  | { type: 'unknown' };

function mapAuthError(error: any): string {
  switch (error?.code) {
    case 'auth/invalid-email':
      return "L'adresse e-mail est invalide.";
    case 'auth/user-disabled':
      return 'Ce compte a été désactivé.';
    case 'auth/user-not-found':
      return 'Aucun compte ne correspond à cet e-mail.';
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Mot de passe incorrect.';
    case 'auth/too-many-requests':
      return 'Trop de tentatives de connexion. Réessayez plus tard.';
    case 'auth/network-request-failed':
      return "Impossible de joindre le serveur d'authentification. Vérifiez que l'émulateur Firebase tourne et est accessible depuis l'appareil.";
    default:
      if (__DEV__) {
        console.warn('[authService] Unmapped auth error:', error?.code, error?.message);
      }
      return 'Une erreur est survenue. Vérifiez votre connexion internet.';
  }
}

export const authService = {
  async login(email: string, password: string) {
    try {
      const credential = await signInWithEmailAndPassword(auth, email, password);
      return credential.user;
    } catch (error: any) {
      throw new Error(mapAuthError(error));
    }
  },

  async logout() {
    await signOut(auth);
  },

  async getAccountContext(uid: string): Promise<AccountContext> {
    const owner = await getDocument('owners', uid);
    if (owner) {
      return { type: 'owner' };
    }

    const members = (await fetchCollection('salon_members', [where('uid', '==', uid)])) as ISalonMember[];
    if (members.length > 0) {
      return { type: 'member', member: members[0] };
    }

    return { type: 'unknown' };
  },

  /**
   * Sets the member's chosen password and clears `mustChangePassword`, mirroring
   * the forced first-login password change flow on the web app.
   */
  async updateMemberPassword(newPassword: string) {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('Votre session a expiré. Reconnectez-vous puis réessayez.');
    }

    try {
      await updatePassword(user, newPassword);
    } catch (error: any) {
      if (error?.code === 'auth/requires-recent-login') {
        throw new Error('Votre session a expiré. Reconnectez-vous puis réessayez.');
      }
      if (error?.code === 'auth/weak-password') {
        throw new Error('Le mot de passe est trop faible.');
      }
      throw new Error('Une erreur est survenue. Réessayez.');
    }

    const members = (await fetchCollection('salon_members', [where('uid', '==', user.uid)])) as ISalonMember[];
    if (members[0]) {
      await editDocument('salon_members', members[0].id, { mustChangePassword: false });
    }
  },
};
