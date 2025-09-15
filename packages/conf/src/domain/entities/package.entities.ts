import { UserTypeEnum } from "../enums/UserTypeEnum"

export interface IPackage {
  id: string
  name: string
  price: number
  currency: string
  countryId: string
  features: string[]
  duration: number
  popular : boolean
  active: boolean
  type?: UserTypeEnum.SALON | UserTypeEnum.CLIENT
  createdAt?: any
  updatedAt?: any
}