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