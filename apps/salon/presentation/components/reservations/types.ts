export type PersonSubStep = 'service' | 'hairdresser' | 'datetime'

export interface PersonBooking {
  serviceId: string
  supplementNames: string[]
  hairdresserId: string
  date: Date | null
  time: string | null
  clientName: string
  clientPhone: string
  clientEmail: string
  linkedClientId: string | null
  saveAsRegularClient: boolean
}

export const emptyPerson = (): PersonBooking => ({
  serviceId: '',
  supplementNames: [],
  hairdresserId: '',
  date: null,
  time: null,
  clientName: '',
  clientPhone: '',
  clientEmail: '',
  linkedClientId: null,
  saveAsRegularClient: false,
})
