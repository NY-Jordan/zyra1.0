import { UserTypeEnum } from '../enums/UserTypeEnum';
export interface PackageData {
  id?: string
  name: string
  price: number
  currency: string
  countryId: string
  features: string[]
  duration: number
  active: boolean
  type: UserTypeEnum
  createdAt?: any
  updatedAt?: any
}


