import { SalonStatusEnum } from "../enums/statusEnum.js"

export interface ISalonFormValues  {
  name: string
  description: string
  phone: string
  email?: string
  address: string
  city: string
  location: Location
  openingHours: OpeningHour[]
  photos?: FileList
  ownerName: string
  ownerPhone: string
  ownerEmail: string
  location_lat: number
  location_lng: number
  password: string
  confirmPassword: string
  category : string
  country : string
}

export type TimeRange = { start: string; end: string } // "HH:MM"

/** `breaks` est optionnel : les documents existants sans pause gardent le même comportement qu'avant. */
export type OpeningHour = { day: string; open: string; close: string, openDay : boolean, breaks?: TimeRange[] }

export type OnboardingStep = 'welcome' | 'config' | 'services' | 'hairdressers' | 'done'

export interface ISalon {
  id : string
  name: string
  description: string
  phone: string
  email?: string
  address: string
  city: string
  location_lat: number
  progress : number,
  location_lng: number
  openingHours: OpeningHour[]
  photos?: FileList | File[] | string[]
  ownerId: string
  services : ISalonService[]
  reservationsCount: number,
  serviceCategories : IServiceCategory[]
  status: {
    name: SalonStatusEnum,
    createdAt?: Date
  },
  createdAt?: Date
  category : string
  country : string
  onboardingStep?: OnboardingStep
  logo?: string
}


export interface IServiceCategory {
  id : string
  name: string
  description?: string
  isActive: boolean
  createdAt?: string
  updatedAt?: string
 }


export type ICreateSalon = {
  name: string
  description: string
  phone: string
  email?: string
  address: string
  city: string
  location_lat: number
  location_lng: number
  openingHours: OpeningHour[]
  photos?: FileList | File[] | string[]
  logo?: File | string
}


export type IRegisterSalon = {
  name: string
  description: string
  phone: string
  email?: string
  photos?: FileList | File[] | string[]
}


export interface ISalonServiceSupplement {
  id : string
  name: string
  price: number
  duration: number
}

export interface ISalonServiceForm {
  name: string
  price: number
  duration: number
  categoryId : string
  supplements: ISalonServiceSupplement[]
  image?: File | null
}

export interface ISalonService {
  id : string
  name: string
  price: number
  duration: number
  categoryId : string
  isActive?: boolean
  supplements: ISalonServiceSupplement[]
  imageUrl?: string | null
}