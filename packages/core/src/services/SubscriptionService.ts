import { 
  CreateSubscriptionData, 
  UpdateSubscriptionData, 
  Subscription,
  SubscriptionStatus,
  BillingPeriod,
  CancellationReason
} from '@zyra/conf/domain/entities/subscriptions.entities';
import { 
  where, 
  orderBy, 
  limit, 
  serverTimestamp,
  Timestamp 
} from 'firebase/firestore'
import { 
  createDocument, 
  editDocument, 
  fetchCollection,
  deleteDocument 
} from '@zyra/conf/lib/query'



export class SubscriptionService {
  private static readonly COLLECTION_NAME = 'subscriptions'

  /**
   * Créer une nouvelle souscription
   */
  static async createSubscription(data: CreateSubscriptionData): Promise<string> {
    try {
      const startDate = serverTimestamp()
      const endDate = this.calculateEndDate(data.billingPeriod)
      const nextBillingDate = data.autoRenew !== false ? endDate : undefined
      const subscriptionData = {
        ...data,
        status: 'active' as const,
        startDate,
        endDate,
        nextBillingDate,
        autoRenew: data.autoRenew !== false,
        renewalCount: 0,
        updatedAt: serverTimestamp()
      }
      const docId = await createDocument(this.COLLECTION_NAME, subscriptionData)
      return docId
    } catch (error) {
      console.error('Erreur lors de la création de la souscription:', error)
      throw new Error('Impossible de créer la souscription')
    }
  }

  /**
   * Calculer la date de fin selon la période de facturation
   */
  private static calculateEndDate(billingPeriod: 'monthly' | 'yearly'): Timestamp {
    const now = new Date()
    if (billingPeriod === 'monthly') {
      now.setMonth(now.getMonth() + 1)
    } else {
      now.setFullYear(now.getFullYear() + 1)
    }
    return Timestamp.fromDate(now)
  }

  /**
   * Mettre à jour une souscription
   */
  static async updateSubscription(subscriptionId: string, updates: UpdateSubscriptionData): Promise<void> {
    try {
      const updateData = {
        ...updates,
        updatedAt: serverTimestamp()
      }
      await editDocument(this.COLLECTION_NAME, subscriptionId, updateData)
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la souscription:', error)
      throw new Error('Impossible de mettre à jour la souscription')
    }
  }

  /**
   * Activer une souscription après paiement réussi
   */
  static async activateSubscription(subscriptionId: string, transactionId?: string): Promise<void> {
    const updates: UpdateSubscriptionData = {
      status: SubscriptionStatus.ACTIVE,
      ...(transactionId && { transactionId })
    }

    await this.updateSubscription(subscriptionId, updates)
  }

  /**
   * Annuler une souscription
   */
  static async cancelSubscription(
    subscriptionId: string, 
    reason?: CancellationReason,
    immediate = false
  ): Promise<void> {
    const updates: UpdateSubscriptionData = {
      status: immediate ? SubscriptionStatus.CANCELLED : SubscriptionStatus.ACTIVE, // Si pas immédiat, reste active jusqu'à la fin
      autoRenew: false,
      cancelledAt: serverTimestamp() as Timestamp,
      ...(reason && { cancellationReason: reason })
    }

    // Si annulation immédiate, mettre la date de fin à maintenant
    if (immediate) {
      updates.endDate = serverTimestamp() as Timestamp
      updates.nextBillingDate = undefined
    }

    await this.updateSubscription(subscriptionId, updates)
  }

  /**
   * Renouveler une souscription
   */
  static async renewSubscription(subscriptionId: string, transactionId?: string): Promise<void> {
    try {
      const subscription = await this.getSubscriptionById(subscriptionId)
      if (!subscription) {
        throw new Error('Souscription non trouvée')
      }

      const newEndDate = this.calculateEndDate(subscription.billingPeriod)
      const nextBillingDate = subscription.autoRenew ? newEndDate : undefined

      const updates: UpdateSubscriptionData = {
        status: SubscriptionStatus.ACTIVE,
        endDate: newEndDate,
        nextBillingDate,
        renewalCount: subscription.renewalCount + 1,
        ...(transactionId && { transactionId })
      }

      await this.updateSubscription(subscriptionId, updates)
    } catch (error) {
      console.error('Erreur lors du renouvellement de la souscription:', error)
      throw new Error('Impossible de renouveler la souscription')
    }
  }

  /**
   * Récupérer une souscription par ID
   */
  static async getSubscriptionById(subscriptionId: string): Promise<Subscription | null> {
    try {
      const constraints = [
        where('id', '==', subscriptionId),
        limit(1)
      ]

      const subscriptions = await fetchCollection(this.COLLECTION_NAME, constraints)
      return subscriptions.length > 0 ? subscriptions[0] as Subscription : null
    } catch (error) {
      console.error('Erreur lors de la récupération de la souscription:', error)
      throw new Error('Impossible de récupérer la souscription')
    }
  }

  /**
   * Récupérer les souscriptions d'un utilisateur (owner)
   */
  static async getUserSubscriptions(userId: string): Promise<Subscription[]> {
    try {
      const constraints = [
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      ]

      const subscriptions = await fetchCollection(this.COLLECTION_NAME, constraints)
      return subscriptions as Subscription[]
    } catch (error) {
      console.error('Erreur lors de la récupération des souscriptions:', error)
      throw new Error('Impossible de récupérer les souscriptions')
    }
  }

  /**
   * Récupérer la souscription active d'un utilisateur
   */
  static async getUserActiveSubscription(userId: string): Promise<Subscription | null> {
    try {
      const constraints = [
        where('userId', '==', userId),
        where('status', '==', 'active'),
        orderBy('endDate', 'desc'),
        limit(1)
      ]

      const subscriptions = await fetchCollection(this.COLLECTION_NAME, constraints)
      
      if (subscriptions.length === 0) {
        return null
      }

      const subscription = subscriptions[0] as Subscription

      // Vérifier si la souscription n'a pas expiré
      const now = new Date()
      const endDate = subscription.endDate.toDate()

      if (endDate < now) {
        // Marquer comme expirée
        await this.updateSubscription(subscription.id!, { status: SubscriptionStatus.EXPIRED })
        return null
      }

      return subscription
    } catch (error) {
      console.error('Erreur lors de la récupération de la souscription active:', error)
      throw new Error('Impossible de récupérer la souscription active')
    }
  }

  /**
   * Récupérer les souscriptions par statut
   */
  static async getSubscriptionsByStatus(
    status: Subscription['status'], 
    limitCount = 50
  ): Promise<Subscription[]> {
    try {
      const constraints = [
        where('status', '==', status),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      ]

      const subscriptions = await fetchCollection(this.COLLECTION_NAME, constraints)
      return subscriptions as Subscription[]
    } catch (error) {
      console.error('Erreur lors de la récupération des souscriptions par statut:', error)
      throw new Error('Impossible de récupérer les souscriptions')
    }
  }

  /**
   * Récupérer les souscriptions qui doivent être renouvelées
   */
  static async getSubscriptionsForRenewal(): Promise<Subscription[]> {
    try {
      const now = Timestamp.now()
      
      const constraints = [
        where('status', '==', 'active'),
        where('autoRenew', '==', true),
        where('nextBillingDate', '<=', now)
      ]

      const subscriptions = await fetchCollection(this.COLLECTION_NAME, constraints)
      return subscriptions as Subscription[]
    } catch (error) {
      console.error('Erreur lors de la récupération des souscriptions à renouveler:', error)
      throw new Error('Impossible de récupérer les souscriptions à renouveler')
    }
  }

  /**
   * Vérifier si un utilisateur a une souscription active
   */
  static async hasActiveSubscription(userId: string): Promise<boolean> {
    const activeSubscription = await this.getUserActiveSubscription(userId)
    return activeSubscription !== null
  }

  /**
   * Supprimer une souscription (utilisation prudente)
   */
  static async deleteSubscription(subscriptionId: string): Promise<void> {
    try {
      await deleteDocument(this.COLLECTION_NAME, subscriptionId)
      console.log('Souscription supprimée:', subscriptionId)
    } catch (error) {
      console.error('Erreur lors de la suppression de la souscription:', error)
      throw new Error('Impossible de supprimer la souscription')
    }
  }

  /**
   * Obtenir les statistiques des souscriptions
   */
  static async getSubscriptionStats(): Promise<{
    total: number
    active: number
    expired: number
    cancelled: number
    pending: number
    totalRevenue: number
  }> {
    try {
      // Récupérer toutes les souscriptions (limité pour les performances)
      const allSubscriptions = await Promise.all([
        this.getSubscriptionsByStatus(SubscriptionStatus.ACTIVE, 1000),
        this.getSubscriptionsByStatus(SubscriptionStatus.EXPIRED, 1000),
        this.getSubscriptionsByStatus(SubscriptionStatus.CANCELLED, 1000),
        this.getSubscriptionsByStatus(SubscriptionStatus.PENDING, 1000)
      ])

      const [active, expired, cancelled, pending] = allSubscriptions
      const total = active.length + expired.length + cancelled.length + pending.length

      // Calculer le revenu total (souscriptions actives et expirées)
      const totalRevenue = [...active, ...expired].reduce((sum, sub) => sum + sub.amount, 0)

      return {
        total,
        active: active.length,
        expired: expired.length,
        cancelled: cancelled.length,
        pending: pending.length,
        totalRevenue
      }
    } catch (error) {
      console.error('Erreur lors du calcul des statistiques des souscriptions:', error)
      throw new Error('Impossible de calculer les statistiques')
    }
  }

  /**
   * Marquer les souscriptions expirées
   */
  static async markExpiredSubscriptions(): Promise<number> {
    try {
      const now = Timestamp.now()
      
      const constraints = [
        where('status', '==', 'active'),
        where('endDate', '<=', now)
      ]

      const expiredSubscriptions = await fetchCollection(this.COLLECTION_NAME, constraints)
      let count = 0

      const updatePromises = expiredSubscriptions.map(async (subscription) => {
        await this.updateSubscription(subscription.id, { status: SubscriptionStatus.EXPIRED })
        count++
      })

      await Promise.all(updatePromises)
      return count
    } catch (error) {
      console.error('Erreur lors du marquage des souscriptions expirées:', error)
      throw new Error('Impossible de marquer les souscriptions expirées')
    }
  }
}
