import { OpeningHour } from "./salons.entities"

export type ContractType = 'commission' | 'salary'
export enum hairDresserAssociationNameEnum {
 SALON_HAIR_DRESSER  = 'hair_dressers_salons_associations'
}
export interface IHairDresser {
  id: string
  name: string
  speciality: string
  email: string
  phone: string
  photo: string
  country: string
  city: string
  reservationsTaken: number
  reservationsConfirmed: number
  reservationsDone: number
  createdAt: Date | string
  status: string
  timestamp?: Date | string
}


export type HairDresserSalonAssociation = {
  salonId : string
  parentId: string,
  active : boolean,
  salary : null|number,
  contractType : ContractType,
  commissionRate : number|null,
  salonServiceIds : string[]
  workingHours : OpeningHour[]
}



export interface IHairDresserInvitation {
  id : string
  salonId: string
  salonName: string
  hairDresserId: string
  hairDresserName: string
  hairDresserEmail: string
  workingHours: OpeningHour[]
  contractType: ContractType
  commissionRate: number | null
  selectedServiceIds : string[]
  salary: number | null
  status: 'pending' | 'accepted' | 'rejected' | 'expired'
  createdAt: string
  expiresAt: string
}


export enum hairDresserInvitationStatusEnum {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
  EXPIRED = 'expired'
}