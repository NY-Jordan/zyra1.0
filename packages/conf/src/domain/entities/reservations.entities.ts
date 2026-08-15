import { Timestamp } from 'firebase/firestore';
import { reservationPaymentMethodEnum, reservationStatusEnum } from '../enums/ReservationEnum.js';
import { ISalonServiceSupplement, OpeningHour } from './salons.entities.js';

// Détails d'une réservation pour une personne
export interface IReservationPerson {
  personNumber: number;
  serviceId: string;
  serviceName: string;
  serviceDuration: number;
  servicePrice: number;
  hairdresserId?: string | null;
  hairdresserName?: string;
  supplements: ISalonServiceSupplement[];
  supplementsTotalPrice: number;
  supplementsTotalDuration: number;
  totalPrice: number;
  totalDuration: number;
  scheduledAt: Timestamp;
  endsAt: Timestamp;
  // Optionnel pour compatibilité avec les réservations créées avant l'introduction
  // du statut par personne — retomber sur IReservation.status si absent.
  status?: reservationStatusEnum;
}

// Réservation globale (peut contenir plusieurs personnes)
export interface IReservation {
  id: string; 
  salonId: string;
  reservationNumber: string; // Numéro de 5 chiffres (ex: "12345")
  createdAt: Timestamp;
  clientName: string;
  clientPhone: string;
  clientEmail?: string;
  userId?: string | null;
  isGuest: boolean;
  status: reservationStatusEnum;
  notes?: string;
  isPaid: boolean;
  paymentMethod: reservationPaymentMethodEnum;
  isSingleReservation: boolean;
  totalPrice: number;
  people: IReservationPerson[];
  earliestScheduledAt?: Timestamp;
  latestEndsAt?: Timestamp;
  // Marqueur : la réservation a été reprogrammée au moins une fois
  wasRescheduled?: boolean;
  rescheduledAt?: Timestamp;
}