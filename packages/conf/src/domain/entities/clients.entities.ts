export type ClientHistoryEntry = { id: string; type: 'order' | 'reservation' }

export interface IClient {
  id: string
  salonId: string
  name: string
  phone: string
  email?: string | null
  // Ancienne valeur : string[] — nouve valeur : ClientHistoryEntry[]
  // Union pour la compatibilité avec les entrées sans type existantes
  history: (string | ClientHistoryEntry)[]
  createdAt: string
  updatedAt: string
}
