import { Timestamp } from 'firebase/firestore';
import { reservationPaymentMethodEnum, reservationStatusEnum } from '../enums/ReservationEnum.js';
import { ISalonServiceSupplement } from './salons.entities.js';


export interface IReservation {
  id: string; 
  salonId: string;
  serviceId: string;
  serviceName: string;
  price: number;
  status: reservationStatusEnum
  scheduledAt: Timestamp;
  endsAt : Timestamp;
  createdAt: Timestamp;
  clientName: string;
  clientPhone: string;
  userId?: string | null;
  isGuest: boolean;
  supplements : string[]
  notes?: string;
  isPaid: boolean;
  paymentMethod: reservationPaymentMethodEnum;
}