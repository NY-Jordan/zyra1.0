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
  fetchCollection 
} from '@zyra/conf/lib/query'

export interface Transaction {
  id?: string
  reference: string
  amount: number
  currency: string
  status: 'pending' | 'success' | 'failed' | 'processing'
  paymentMethod: 'card' | 'mobile_money'
  userId: string
  userEmail?: string
  userName?: string
  packageId: string
  packageName: string
  billingPeriod: 'monthly' | 'yearly'
  korapayTransactionId?: string
  korapayReference?: string
  metadata?: Record<string, any>
  createdAt: Timestamp
  updatedAt: Timestamp
  completedAt?: Timestamp
  failureReason?: string
}

export interface CreateTransactionData {
  reference: string
  amount: number
  currency: string
  paymentMethod: 'card' | 'mobile_money'
  userId: string
  userEmail?: string
  userName?: string
  packageId: string
  packageName: string
  billingPeriod: 'monthly' | 'yearly' | string
  korapayTransactionId?: string
  korapayReference?: string
  metadata?: Record<string, any>
}

export interface UpdateTransactionData {
  status?: 'pending' | 'success' | 'failed' | 'processing'
  korapayTransactionId?: string
  korapayReference?: string
  metadata?: Record<string, any>
  completedAt?: Timestamp
  failureReason?: string
}

export class TransactionService {
  private static readonly COLLECTION_NAME = 'transactions'

  /**
   * Créer une nouvelle transaction
   */
  static async createTransaction(data: CreateTransactionData): Promise<string> {
    try {
        console.log('iuci');
      const transactionData = {
        ...data,
        status: 'pending' as const,
        updatedAt: serverTimestamp()
      }
      console.log('Creating transaction with data:', transactionData)
      const docId = await createDocument(this.COLLECTION_NAME, transactionData)
      console.log('Transaction créée avec ID:', docId)
      return docId
    } catch (error) {
      console.error('Erreur lors de la création de la transaction:', error)
      throw new Error('Impossible de créer la transaction')
    }
  }

  /**
   * Mettre à jour une transaction existante
   */
  static async updateTransaction(transactionId: string, updates: UpdateTransactionData): Promise<void> {
    try {
      const updateData = {
        ...updates,
        updatedAt: serverTimestamp()
      }

      await editDocument(this.COLLECTION_NAME, transactionId, updateData)
      console.log('Transaction mise à jour:', transactionId)
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la transaction:', error)
      throw new Error('Impossible de mettre à jour la transaction')
    }
  }

  /**
   * Marquer une transaction comme réussie
   */
  static async markTransactionAsSuccess(
    transactionId: string, 
    korapayData?: { transactionId?: string; reference?: string }
  ): Promise<void> {
    const updates: UpdateTransactionData = {
      status: 'success',
      completedAt: serverTimestamp() as Timestamp,
      ...(korapayData?.transactionId && { korapayTransactionId: korapayData.transactionId }),
      ...(korapayData?.reference && { korapayReference: korapayData.reference })
    }

    await this.updateTransaction(transactionId, updates)
  }

  /**
   * Marquer une transaction comme échouée
   */
  static async markTransactionAsFailed(transactionId: string, reason?: string): Promise<void> {
    const updates: UpdateTransactionData = {
      status: 'failed',
      completedAt: serverTimestamp() as Timestamp,
      ...(reason && { failureReason: reason })
    }

    await this.updateTransaction(transactionId, updates)
  }

  /**
   * Marquer une transaction comme en cours de traitement
   */
  static async markTransactionAsProcessing(
    transactionId: string, 
    korapayData?: { transactionId?: string; reference?: string }
  ): Promise<void> {
    const updates: UpdateTransactionData = {
      status: 'processing',
      ...(korapayData?.transactionId && { korapayTransactionId: korapayData.transactionId }),
      ...(korapayData?.reference && { korapayReference: korapayData.reference })
    }

    await this.updateTransaction(transactionId, updates)
  }

  /**
   * Récupérer les transactions d'un utilisateur
   */
  static async getUserTransactions(userId: string, limitCount = 50): Promise<Transaction[]> {
    try {
      const constraints = [
        where('userId', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      ]

      const transactions = await fetchCollection(this.COLLECTION_NAME, constraints)
      return transactions as Transaction[]
    } catch (error) {
      console.error('Erreur lors de la récupération des transactions:', error)
      throw new Error('Impossible de récupérer les transactions')
    }
  }

  /**
   * Récupérer une transaction par sa référence
   */
  static async getTransactionByReference(reference: string): Promise<Transaction | null> {
    try {
      const constraints = [
        where('reference', '==', reference),
        limit(1)
      ]

      const transactions = await fetchCollection(this.COLLECTION_NAME, constraints)
      return transactions.length > 0 ? transactions[0] as Transaction : null
    } catch (error) {
      console.error('Erreur lors de la récupération de la transaction:', error)
      throw new Error('Impossible de récupérer la transaction')
    }
  }

  /**
   * Récupérer une transaction par sa référence Korapay
   */
  static async getTransactionByKorapayReference(korapayReference: string): Promise<Transaction | null> {
    try {
      const constraints = [
        where('korapayReference', '==', korapayReference),
        limit(1)
      ]

      const transactions = await fetchCollection(this.COLLECTION_NAME, constraints)
      return transactions.length > 0 ? transactions[0] as Transaction : null
    } catch (error) {
      console.error('Erreur lors de la récupération de la transaction par référence Korapay:', error)
      throw new Error('Impossible de récupérer la transaction')
    }
  }

  /**
   * Récupérer les transactions par statut
   */
  static async getTransactionsByStatus(
    status: Transaction['status'], 
    limitCount = 50
  ): Promise<Transaction[]> {
    try {
      const constraints = [
        where('status', '==', status),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      ]

      const transactions = await fetchCollection(this.COLLECTION_NAME, constraints)
      return transactions as Transaction[]
    } catch (error) {
      console.error('Erreur lors de la récupération des transactions par statut:', error)
      throw new Error('Impossible de récupérer les transactions')
    }
  }

  /**
   * Récupérer les statistiques de transaction pour un utilisateur
   */
  static async getUserTransactionStats(userId: string): Promise<{
    total: number
    successful: number
    pending: number
    failed: number
    totalAmount: number
  }> {
    try {
      const transactions = await this.getUserTransactions(userId, 1000) // Récupérer plus pour les stats

      const stats = {
        total: transactions.length,
        successful: 0,
        pending: 0,
        failed: 0,
        totalAmount: 0
      }

      transactions.forEach(transaction => {
        switch (transaction.status) {
          case 'success':
            stats.successful++
            stats.totalAmount += transaction.amount
            break
          case 'pending':
          case 'processing':
            stats.pending++
            break
          case 'failed':
            stats.failed++
            break
        }
      })

      return stats
    } catch (error) {
      console.error('Erreur lors du calcul des statistiques:', error)
      throw new Error('Impossible de calculer les statistiques')
    }
  }
}
