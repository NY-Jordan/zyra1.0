import type { ContractType } from '@zyra/conf/domain/entities/hairdressers.entities';
import { hairDresserInvitationStatusEnum } from '@zyra/conf/domain/entities/hairdressers.entities';

export type Hairdresser = {
  id: string;
  name: string;
  speciality: string;
  email: string;
  phone: string;
  city: string;
  active: boolean;
  reservationsTaken: number;
  reservationsConfirmed: number;
  reservationsDone: number;
  services: string[];
  contractType: ContractType;
  contractValue: number;
};

export type Invitation = {
  id: string;
  name: string;
  email: string;
  status: hairDresserInvitationStatusEnum;
  sentDate: string;
  contractType: ContractType;
  contractValue: number;
};

export const MOCK_HAIRDRESSERS: Hairdresser[] = [
  {
    id: '1',
    name: 'Junior Foka',
    speciality: 'Coupes & dégradés',
    email: 'junior.foka@example.com',
    phone: '+237 6 90 55 44 33',
    city: 'Douala',
    active: true,
    reservationsTaken: 42,
    reservationsConfirmed: 38,
    reservationsDone: 35,
    services: ['Coupe Homme', 'Dégradé', 'Barbe'],
    contractType: 'commission',
    contractValue: 30,
  },
  {
    id: '2',
    name: 'Sarah Biya',
    speciality: 'Tresses & coloration',
    email: 'sarah.biya@example.com',
    phone: '+237 6 90 66 77 88',
    city: 'Douala',
    active: true,
    reservationsTaken: 61,
    reservationsConfirmed: 55,
    reservationsDone: 52,
    services: ['Tresses', 'Coloration', 'Brushing'],
    contractType: 'salary',
    contractValue: 150000,
  },
  {
    id: '3',
    name: 'Michel Owona',
    speciality: 'Coupes classiques',
    email: 'michel.owona@example.com',
    phone: '+237 6 90 22 11 00',
    city: 'Yaoundé',
    active: false,
    reservationsTaken: 12,
    reservationsConfirmed: 10,
    reservationsDone: 9,
    services: ['Coupe Homme'],
    contractType: 'commission',
    contractValue: 25,
  },
];

export const MOCK_INVITATIONS: Invitation[] = [
  {
    id: 'i1',
    name: 'Grace Mballa',
    email: 'grace.mballa@example.com',
    status: hairDresserInvitationStatusEnum.PENDING,
    sentDate: '20 Juil 2026',
    contractType: 'commission',
    contractValue: 30,
  },
  {
    id: 'i2',
    name: 'Eric Tabi',
    email: 'eric.tabi@example.com',
    status: hairDresserInvitationStatusEnum.ACCEPTED,
    sentDate: '10 Juil 2026',
    contractType: 'salary',
    contractValue: 120000,
  },
];
