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
    dotClass: 'bg-amber-500 dark:bg-amber-400',
    bg: 'bg-amber-50/95 dark:bg-amber-950/45',
    border: 'border-amber-300/80 dark:border-amber-600/50',
    text: 'text-amber-900 dark:text-amber-100',
  },
  [reservationStatusEnum.confirmed]: {
    label: 'Confirmée',
    dotClass: 'bg-sky-500 dark:bg-sky-400',
    bg: 'bg-sky-50/95 dark:bg-sky-950/45',
    border: 'border-sky-300/80 dark:border-sky-600/50',
    text: 'text-sky-900 dark:text-sky-100',
  },
  [reservationStatusEnum.completed]: {
    label: 'Terminée',
    dotClass: 'bg-emerald-500 dark:bg-emerald-400',
    bg: 'bg-emerald-50/95 dark:bg-emerald-950/45',
    border: 'border-emerald-300/80 dark:border-emerald-600/50',
    text: 'text-emerald-900 dark:text-emerald-100',
  },
  [reservationStatusEnum.canceled]: {
    label: 'Annulée',
    dotClass: 'bg-slate-400 dark:bg-slate-500',
    bg: 'bg-slate-100/95 dark:bg-slate-800/80',
    border: 'border-slate-300/80 dark:border-slate-600/50',
    text: 'text-slate-600 dark:text-slate-200',
  },
}
