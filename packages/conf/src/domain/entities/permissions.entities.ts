export type RoleId = 'owner' | 'manager' | 'receptionist' | 'hairdresser'

export interface IRole {
  id: RoleId
  label: string
  description: string
  locked?: boolean
}

export const ROLES: IRole[] = [
  {
    id: 'owner',
    label: 'Propriétaire',
    description: 'Accès complet à toutes les fonctionnalités du salon',
    locked: true,
  },
  {
    id: 'manager',
    label: 'Manager',
    description: "Gère l'équipe, les rendez-vous, les clients et les paramètres",
  },
  {
    id: 'receptionist',
    label: 'Réceptionniste',
    description: 'Gère les rendez-vous et les clients au quotidien',
  },
  {
    id: 'hairdresser',
    label: 'Coiffeur',
    description: 'Accède à son planning et à ses propres rendez-vous',
  },
]

export const ROLE_IDS: RoleId[] = ROLES.map(r => r.id)

export const getRole = (roleId: RoleId): IRole => ROLES.find(r => r.id === roleId)!

export interface IPermission {
  id?: string
  key: string
  label: string
  group: string
  order?: number
  createdAt?: any
  updatedAt?: any
}

/**
 * Catalogue de permissions de référence, seedé en base (collection `permissions`)
 * depuis l'app admin. Sert aussi de fallback côté salon tant que le catalogue
 * n'a pas encore été seedé.
 */
export const PERMISSIONS_SEED: Omit<IPermission, 'id' | 'createdAt' | 'updatedAt'>[] = [
  { key: 'bookings.view', label: 'Voir les rendez-vous', group: 'Réservations', order: 1 },
  { key: 'bookings.manage', label: 'Créer, modifier, annuler', group: 'Réservations', order: 2 },
  { key: 'clients.view', label: 'Voir les clients', group: 'Clients', order: 3 },
  { key: 'clients.manage', label: 'Ajouter, modifier les clients', group: 'Clients', order: 4 },
  { key: 'services.manage', label: 'Gérer les services', group: 'Services', order: 5 },
  { key: 'hairdressers.manage', label: 'Gérer les coiffeurs', group: 'Coiffeurs', order: 6 },
  { key: 'payments.view', label: 'Voir les paiements', group: 'Paiements', order: 7 },
  { key: 'payments.manage', label: 'Gérer les transactions', group: 'Paiements', order: 8 },
  { key: 'settings.manage', label: 'Modifier les paramètres du salon', group: 'Paramètres', order: 9 },
  { key: 'administration.manage', label: 'Gérer les utilisateurs et permissions', group: 'Administration', order: 10 },
]

/** Permissions activées par défaut pour chaque rôle, à la création d'un salon. */
export const DEFAULT_ROLE_PERMISSIONS: Record<RoleId, string[]> = {
  owner: PERMISSIONS_SEED.map(p => p.key),
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

/**
 * Permissions socle par rôle : toujours actives et non désactivables par
 * l'owner, même quand le rôle lui-même n'est pas verrouillé (cf. `IRole.locked`).
 */
export const LOCKED_ROLE_PERMISSIONS: Partial<Record<RoleId, string[]>> = {
  hairdresser: ['bookings.view', 'clients.view'],
}

export const isPermissionLocked = (roleId: RoleId, permissionKey: string) =>
  (LOCKED_ROLE_PERMISSIONS[roleId] || []).includes(permissionKey)

export const PERMISSIONS_COLLECTION = 'permissions'
export const ROLE_PERMISSIONS_SUBCOLLECTION = 'role_permissions'
export const SALON_MEMBERS_COLLECTION = 'salon_members'

/** Doc de la sous-collection `salons/{salonId}/role_permissions/{roleId}`. */
export interface ISalonRolePermissions {
  id: RoleId
  roleId: RoleId
  permissionKeys: string[]
  createdAt?: any
  updatedAt?: any
}

export type MemberStatus = 'active' | 'invited' | 'suspended'

/** Doc de la collection plate `salon_members`, scopée par `salonId`. */
export interface ISalonMember {
  id: string
  salonId: string
  name: string
  email: string
  roleId: RoleId
  status: MemberStatus
  addedAt: string
  createdAt?: any
}
