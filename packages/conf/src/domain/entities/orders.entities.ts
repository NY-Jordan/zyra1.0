export interface IOrder {
  id: string
  salonId: string
  serviceId: string
  serviceName: string
  hairDresserId: string
  hairDresserName: string
  clientName: string
  clientPhone: string
  clientEmail?: string
  clientId?: string | null
  price: number
  supplements: string[]
  supplementsPrice: number
  totalPrice: number
  paymentMethod: 'cash' | 'mobile'
  isPaid: boolean
  status: 'pending' | 'completed' | 'canceled'
  notes?: string
  createdAt: string
  completedAt?: string
}
