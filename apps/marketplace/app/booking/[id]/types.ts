import { ISalonService, ISalonServiceSupplement } from '@zyra/conf/domain/entities/salons.entities'
import { HairDresserSalonAssociation, IHairDresser } from '@zyra/conf/domain/entities/hairdressers.entities'

export type ReservationType = 'single' | 'multiple' | null

export interface Booking {
  personNumber: number
  service: ISalonService | null
  supplements: ISalonServiceSupplement[]
  hairdresser: HairDresserSalonAssociation | null
  date: Date | null
  time: string | null
}

export interface ClientInfo {
  clientName: string
  clientPhone: string
  clientEmail: string
  notes: string
}

export interface BookingState {
  currentStep: number
  reservationType: ReservationType
  currentPersonIndex: number
  multipleBookings: Booking[]
  clientInfo: ClientInfo
}
