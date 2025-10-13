export interface Transaction {
  id?: string
  reference: string
  userId: string
  userEmail?: string
  userName?: string
  amount: number
  currency: string
  status: 'pending' | 'success' | 'failed' | 'cancelled'
  paymentMethod: 'card' | 'mobile_money'
  description?: string
  createdAt: any
  updatedAt?: any
  korapayReference?: string
}
