export interface IClient {
  id: string
  salonId: string
  name: string
  phone: string
  email?: string | null
  history: string[] // IDs des commandes et réservations
  createdAt: string
  updatedAt: string
}
