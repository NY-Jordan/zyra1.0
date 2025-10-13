import { SalonStatusEnum } from "../enums/statusEnum"

export interface IOwner {
  name: string
  phone: string
  email: string
  password: string
  photo?: string
  id : string
  status : {
    name : SalonStatusEnum
    createdAt : Date
  }
}


export interface IRegisterOwner extends Omit<IOwner, "photo" | "id"> {
  photo?: File | string;
}