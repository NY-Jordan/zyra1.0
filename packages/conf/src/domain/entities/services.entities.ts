export interface IService {
  id: string
  name: string
  reservations: number
  status: boolean
  createdAt: Date | string
  timestamp: Date | string
}