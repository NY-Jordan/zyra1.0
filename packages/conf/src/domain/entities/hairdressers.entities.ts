export type ContractType = 'commission' | 'salary'
export interface IHairDresser {
  id: string
  name: string
  speciality: string
  email: string
  phone: string
  photo: string
  country: string
  city: string
  salonIds?: HairDresserSalonAssociation[]
  reservationsTaken: number
  reservationsConfirmed: number
  reservationsDone: number
  createdAt: Date | string
  status: string
  timestamp?: Date | string
}


export type HairDresserSalonAssociation = {
    salonId : string
    active : boolean
}

export interface WorkingHours {
  [key: string]: { 
    start: string
    end: string
    active: boolean 
  }
}

export interface IHairDresserInvitation {
  id : string
  salonId: string
  salonName: string
  hairDresserId: string
  hairDresserName: string
  hairDresserEmail: string
  workingDays: string[]
  workingHours: WorkingHours
  contractType: ContractType
  commissionRate: number | null
  salary: number | null
  status: 'pending' | 'accepted' | 'rejected' | 'expired'
  createdAt: string
  expiresAt: string
}