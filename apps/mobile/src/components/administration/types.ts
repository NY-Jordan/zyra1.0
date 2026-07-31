import type { RoleId } from '@zyra/conf/domain/entities/permissions.entities';
import { memberStatusEnum } from '@zyra/conf/domain/enums/MemberEnum';

import type { StatusTone } from '@/components/ui/shared';

export type TeamMember = {
  id: string;
  name: string;
  email: string;
  role: RoleId;
  status: memberStatusEnum;
};

export const MEMBER_STATUS_LABELS: Record<memberStatusEnum, string> = {
  [memberStatusEnum.active]: 'Actif',
  [memberStatusEnum.invited]: 'Invitation envoyée',
  [memberStatusEnum.suspended]: 'Suspendu',
};

export const MEMBER_STATUS_TONES: Record<memberStatusEnum, StatusTone> = {
  [memberStatusEnum.active]: 'emerald',
  [memberStatusEnum.invited]: 'amber',
  [memberStatusEnum.suspended]: 'rose',
};

export const MOCK_MEMBERS: TeamMember[] = [
  { id: '1', name: 'Awa Zogo', email: 'awa.zogo@example.com', role: 'owner', status: memberStatusEnum.active },
  { id: '2', name: 'Paul Ngando', email: 'paul.ngando@example.com', role: 'manager', status: memberStatusEnum.active },
  { id: '3', name: 'Clarisse Ebogo', email: 'clarisse.ebogo@example.com', role: 'receptionist', status: memberStatusEnum.active },
  { id: '4', name: 'David Essomba', email: 'david.essomba@example.com', role: 'manager', status: memberStatusEnum.invited },
  { id: '5', name: 'Nadia Fouda', email: 'nadia.fouda@example.com', role: 'receptionist', status: memberStatusEnum.suspended },
];
