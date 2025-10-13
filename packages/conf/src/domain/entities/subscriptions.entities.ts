import { Timestamp } from "@firebase/firestore"

export enum SubscriptionStatus {
  ACTIVE = 'active',
  EXPIRED = 'expired',
  CANCELLED = 'cancelled',
  PENDING = 'pending'
}

export enum BillingPeriod {
  MONTHLY = 'monthly',
  YEARLY = 'yearly'
}



export enum CancellationReason {
  USER_REQUEST = 'user_request',
  PAYMENT_FAILED = 'payment_failed',
  POLICY_VIOLATION = 'policy_violation',
  EXPIRED = 'expired',
  ADMIN_ACTION = 'admin_action',
  OTHER = 'other'
}

export interface Subscription {
  id?: string
  userId: string
  userEmail?: string
  userName?: string
  packageId: string
  packageName: string
  packageFeatures: string[]
  billingPeriod: BillingPeriod
  amount: number
  currency: string
  status: SubscriptionStatus
  startDate: Timestamp
  endDate: Timestamp
  nextBillingDate?: Timestamp
  transactionId?: string
  autoRenew: boolean
  cancelledAt?: Timestamp
  cancellationReason?: CancellationReason
  renewalCount: number
  metadata?: Record<string, any>
  createdAt: Timestamp
  updatedAt: Timestamp
}

export interface CreateSubscriptionData {
  userId: string
  userEmail?: string
  userName?: string
  packageId: string
  packageName: string
  packageFeatures: string[]
  billingPeriod: BillingPeriod
  amount: number
  currency: string
  transactionId?: string
  autoRenew?: boolean
  metadata?: Record<string, any>
}

export interface UpdateSubscriptionData {
  status?: SubscriptionStatus
  endDate?: Timestamp
  nextBillingDate?: Timestamp
  transactionId?: string
  autoRenew?: boolean
  cancelledAt?: Timestamp
  cancellationReason?: CancellationReason
  renewalCount?: number
  metadata?: Record<string, any>
}