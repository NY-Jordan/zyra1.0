import { Timestamp } from 'firebase/firestore';
import { TimeRange } from './salons.entities.js';

export type { TimeRange };

/** Indisponibilité exceptionnelle d'un professionnel un jour donné (congé, absence...). */
export interface IHairdresserAbsence {
  id: string;
  salonId: string;
  hairdresserId: string;
  date: string; // 'YYYY-MM-DD'
  allDay: boolean;
  /** Requis si allDay=false : la plage précise d'indisponibilité ce jour-là. */
  range?: TimeRange;
  reason?: string;
  createdAt: Timestamp;
}
