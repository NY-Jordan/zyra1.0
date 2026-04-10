import { reservationStatusEnum } from '@zyra/conf/domain/enums/ReservationEnum'

export type CalendarStatusMeta = {
  label: string
  dotClass: string
  bg: string
  border: string
  text: string
}

export const CALENDAR_STATUS_META: Record<reservationStatusEnum, CalendarStatusMeta> = {
  [reservationStatusEnum.pending]: {
    label: 'En attente',
    dotClass: 'bg-amber-400',
    bg: 'bg-amber-50',
    border: 'border-amber-300',
    text: 'text-amber-800',
  },
  [reservationStatusEnum.confirmed]: {
    label: 'Confirmée',
    dotClass: 'bg-blue-500',
    bg: 'bg-blue-50',
    border: 'border-blue-300',
    text: 'text-blue-800',
  },
  [reservationStatusEnum.completed]: {
    label: 'Terminée',
    dotClass: 'bg-emerald-500',
    bg: 'bg-emerald-50',
    border: 'border-emerald-300',
    text: 'text-emerald-800',
  },
  [reservationStatusEnum.canceled]: {
    label: 'Annulée',
    dotClass: 'bg-gray-400',
    bg: 'bg-gray-100',
    border: 'border-gray-300',
    text: 'text-gray-500',
  },
}
