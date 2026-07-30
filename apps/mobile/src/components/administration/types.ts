export type RoleId = 'owner' | 'manager' | 'receptionist' | 'hairdresser';

export type MemberStatus = 'active' | 'invited' | 'suspended';

export type TeamMember = {
  id: string;
  name: string;
  email: string;
  role: RoleId;
  status: MemberStatus;
};

export const ROLE_LABELS: Record<RoleId, string> = {
  owner: 'Propriétaire',
  manager: 'Manager',
  receptionist: 'Réceptionniste',
  hairdresser: 'Coiffeur',
};

export const MEMBER_STATUS_LABELS: Record<MemberStatus, string> = {
  active: 'Actif',
  invited: 'Invitation envoyée',
  suspended: 'Suspendu',
};

export const MEMBER_STATUS_TONES: Record<MemberStatus, 'emerald' | 'amber' | 'rose'> = {
  active: 'emerald',
  invited: 'amber',
  suspended: 'rose',
};

export const MOCK_MEMBERS: TeamMember[] = [
  { id: '1', name: 'Awa Zogo', email: 'awa.zogo@example.com', role: 'owner', status: 'active' },
  { id: '2', name: 'Paul Ngando', email: 'paul.ngando@example.com', role: 'manager', status: 'active' },
  { id: '3', name: 'Clarisse Ebogo', email: 'clarisse.ebogo@example.com', role: 'receptionist', status: 'active' },
  { id: '4', name: 'David Essomba', email: 'david.essomba@example.com', role: 'manager', status: 'invited' },
  { id: '5', name: 'Nadia Fouda', email: 'nadia.fouda@example.com', role: 'receptionist', status: 'suspended' },
];
