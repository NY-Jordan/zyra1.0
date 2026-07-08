export type RoleId = 'owner' | 'manager' | 'receptionist' | 'hairdresser'

export interface Role {
  id: RoleId
  label: string
  description: string
  bg: string
  text: string
  dot: string
  locked?: boolean
}

export const ROLES: Role[] = [
  {
    id: 'owner',
    label: 'Propriétaire',
    description: 'Accès complet à toutes les fonctionnalités du salon',
    bg: 'bg-[#EEF8F0] dark:bg-emerald-950/20',
    text: 'text-emerald-700 dark:text-emerald-400',
    dot: 'bg-emerald-500',
    locked: true,
  },
  {
    id: 'manager',
    label: 'Manager',
    description: "Gère l'équipe, les rendez-vous, les clients et les paramètres",
    bg: 'bg-[#F2EDFE] dark:bg-violet-950/20',
    text: 'text-violet-700 dark:text-violet-400',
    dot: 'bg-violet-500',
  },
  {
    id: 'receptionist',
    label: 'Réceptionniste',
    description: 'Gère les rendez-vous et les clients au quotidien',
    bg: 'bg-[#ECF6FE] dark:bg-sky-950/20',
    text: 'text-sky-700 dark:text-sky-400',
    dot: 'bg-sky-500',
  },
  {
    id: 'hairdresser',
    label: 'Coiffeur',
    description: 'Accède à son planning et à ses propres rendez-vous',
    bg: 'bg-[#FEF6EC] dark:bg-amber-950/20',
    text: 'text-amber-700 dark:text-amber-400',
    dot: 'bg-amber-500',
  },
]

export const getRole = (roleId: RoleId) => ROLES.find(r => r.id === roleId)!

export interface Permission {
  key: string
  label: string
  group: string
}

export const PERMISSIONS: Permission[] = [
  { key: 'bookings.view', label: 'Voir les rendez-vous', group: 'Réservations' },
  { key: 'bookings.manage', label: 'Créer, modifier, annuler', group: 'Réservations' },
  { key: 'clients.view', label: 'Voir les clients', group: 'Clients' },
  { key: 'clients.manage', label: 'Ajouter, modifier les clients', group: 'Clients' },
  { key: 'services.manage', label: 'Gérer les services', group: 'Services' },
  { key: 'hairdressers.manage', label: 'Gérer les coiffeurs', group: 'Coiffeurs' },
  { key: 'payments.view', label: 'Voir les paiements', group: 'Paiements' },
  { key: 'payments.manage', label: 'Gérer les transactions', group: 'Paiements' },
  { key: 'settings.manage', label: 'Modifier les paramètres du salon', group: 'Paramètres' },
  { key: 'administration.manage', label: 'Gérer les utilisateurs et permissions', group: 'Administration' },
]

export const PERMISSION_GROUPS = Array.from(new Set(PERMISSIONS.map(p => p.group)))

export const DEFAULT_ROLE_PERMISSIONS: Record<RoleId, string[]> = {
  owner: PERMISSIONS.map(p => p.key),
  manager: [
    'bookings.view', 'bookings.manage',
    'clients.view', 'clients.manage',
    'services.manage', 'hairdressers.manage',
    'payments.view', 'payments.manage',
    'settings.manage',
  ],
  receptionist: ['bookings.view', 'bookings.manage', 'clients.view', 'clients.manage', 'payments.view'],
  hairdresser: ['bookings.view', 'clients.view'],
}

export type MemberStatus = 'active' | 'invited' | 'suspended'

export interface TeamMember {
  id: string
  name: string
  email: string
  roleId: RoleId
  status: MemberStatus
  addedAt: string
}

export const MOCK_TEAM_MEMBERS: TeamMember[] = [
  {
    id: 'member-1',
    name: 'Awa Diallo',
    email: 'awa.diallo@example.com',
    roleId: 'manager',
    status: 'active',
    addedAt: '2026-03-12',
  },
  {
    id: 'member-2',
    name: 'Marc Kouassi',
    email: 'marc.kouassi@example.com',
    roleId: 'receptionist',
    status: 'active',
    addedAt: '2026-05-02',
  },
  {
    id: 'member-3',
    name: 'Fatou Ndiaye',
    email: 'fatou.ndiaye@example.com',
    roleId: 'hairdresser',
    status: 'invited',
    addedAt: '2026-07-01',
  },
]
