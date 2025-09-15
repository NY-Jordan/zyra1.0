export interface IOwner {
  name: string
  phone: string
  email: string
  password: string
  photo?: string
  id : string
}


export interface IRegisterOwner extends Omit<IOwner, "photo" | "id"> {
  photo?: File | string;
}