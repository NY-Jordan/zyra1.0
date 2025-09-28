import { signInWithEmailAndPassword } from "firebase/auth";
import { where } from "firebase/firestore";
import { auth } from "@zyra/conf/lib/firebase";
import { fetchCollection } from "@zyra/conf/lib/query";

/**
 * Service d'authentification qui gère la connexion et la vérification des abonnements
 */
export const ownerAuthService = {
  /**
   * Connecte un utilisateur avec son email et mot de passe
   * @param email Email de l'utilisateur
   * @param password Mot de passe de l'utilisateur
   * @returns Les informations de l'utilisateur connecté
   */
  async login(email: string, password: string) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    } catch (error: any) {
      // Transformer les codes d'erreur Firebase en messages lisibles
      let errorMessage = "Une erreur est survenue. Veuillez réessayer.";
      switch (error.code) {
        case 'auth/invalid-email':
          errorMessage = "L'adresse email est invalide.";
          break;
        case 'auth/user-disabled':
          errorMessage = "Ce compte a été désactivé.";
          break;
        case 'auth/user-not-found':
          errorMessage = "Aucun compte ne correspond à cet email.";
          break;
        case 'auth/wrong-password':
          errorMessage = "Mot de passe incorrect.";
          break;
        case 'auth/too-many-requests':
          errorMessage = "Trop de tentatives de connexion. Veuillez réessayer plus tard.";
          break;
      }
      throw { message: errorMessage, originalError: error };
    }
  },

  /**
   * Vérifie si un utilisateur a un abonnement actif
   * @param userId ID de l'utilisateur
   * @returns Un objet indiquant où rediriger l'utilisateur et les messages à afficher
   */
  async checkSubscriptionStatus(userId: string) {
    try {
      const salons = await fetchCollection("salons", [
        where("ownerId", "==", userId),
      ]);
      if (!salons || salons.length === 0) {
        return {
          hasSubscription: false,
          redirectTo: '/auth/login',
          message: "Vous ne posseder aucun salon. Veuillez contacter le support."
        };
      }
      const subscriptions = await fetchCollection("subscriptions", [
        where("ownerId", "==", userId),
        where("status", "==", "active")
      ]);
      if (!subscriptions || subscriptions.length === 0) {
        // Aucun abonnement actif trouvé
        return {
          hasSubscription: false,
          redirectTo: '/salon/payment/packages',
          message: "Votre forfait a expiré. Veuillez en sélectionner un nouveau."
        };
      } else {
        return {
          hasSubscription: true,
          redirectTo: '/salon',
          message: "Connexion réussie"
        };
      }
    } catch (error) {
      console.error("Erreur lors de la vérification de l'abonnement:", error);
      return {
        hasSubscription: true,
        redirectTo: '/salon',
        message: "Connexion réussie"
      };
    }
  }
};