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
 *
 * Granularité par module : `view` (voir), `create` (créer), `edit` (modifier /
 * faire progresser), `delete` (supprimer) et quelques actions spécifiques
 * isolées car sensibles (`bookings.cancel`, `hairdressers.status`) ou parce
 * qu'elles couvrent un sous-module distinct (`services.categories`) ou une
 * sous-section indépendante (`settings.general/hours/location/gallery`).
 */
export const PERMISSIONS_SEED: Omit<IPermission, 'id' | 'createdAt' | 'updatedAt'>[] = [
  // Réservations
  { key: 'bookings.view', label: 'Voir les rendez-vous', group: 'Réservations', order: 1 },
  { key: 'bookings.create', label: 'Créer un rendez-vous', group: 'Réservations', order: 2 },
  { key: 'bookings.edit', label: 'Modifier / faire progresser un rendez-vous', group: 'Réservations', order: 3 },
  { key: 'bookings.cancel', label: 'Annuler un rendez-vous', group: 'Réservations', order: 4 },
  // Commandes
  { key: 'orders.view', label: 'Voir les commandes', group: 'Commandes', order: 5 },
  { key: 'orders.create', label: 'Créer une commande', group: 'Commandes', order: 6 },
  { key: 'orders.delete', label: 'Supprimer une commande', group: 'Commandes', order: 7 },
  // Services
  { key: 'services.view', label: 'Voir les services', group: 'Services', order: 8 },
  { key: 'services.create', label: 'Créer un service', group: 'Services', order: 9 },
  { key: 'services.edit', label: 'Modifier / activer-désactiver un service', group: 'Services', order: 10 },
  { key: 'services.delete', label: 'Supprimer un service', group: 'Services', order: 11 },
  { key: 'services.categories', label: 'Gérer les catégories de services', group: 'Services', order: 12 },
  // Coiffeurs
  { key: 'hairdressers.view', label: 'Voir les coiffeurs', group: 'Coiffeurs', order: 13 },
  { key: 'hairdressers.invite', label: 'Inviter un coiffeur', group: 'Coiffeurs', order: 14 },
  { key: 'hairdressers.edit', label: 'Modifier un coiffeur ou une invitation', group: 'Coiffeurs', order: 15 },
  { key: 'hairdressers.status', label: 'Suspendre / réactiver un coiffeur', group: 'Coiffeurs', order: 16 },
  { key: 'hairdressers.delete', label: 'Retirer un coiffeur', group: 'Coiffeurs', order: 17 },
  // Clients
  { key: 'clients.view', label: 'Voir les clients', group: 'Clients', order: 18 },
  { key: 'clients.create', label: 'Créer un client', group: 'Clients', order: 19 },
  { key: 'clients.edit', label: 'Modifier un client', group: 'Clients', order: 20 },
  { key: 'clients.delete', label: 'Supprimer un client', group: 'Clients', order: 21 },
  // Paiements
  { key: 'payments.view', label: 'Voir les paiements', group: 'Paiements', order: 22 },
  { key: 'payments.manage', label: 'Marquer comme payé', group: 'Paiements', order: 23 },
  // Paramètres
  { key: 'settings.view', label: 'Voir les paramètres du salon', group: 'Paramètres', order: 24 },
  { key: 'settings.general', label: 'Modifier les informations générales', group: 'Paramètres', order: 25 },
  { key: 'settings.hours', label: "Modifier les horaires d'ouverture", group: 'Paramètres', order: 26 },
  { key: 'settings.location', label: 'Modifier la localisation', group: 'Paramètres', order: 27 },
  { key: 'settings.gallery', label: 'Gérer la galerie photos', group: 'Paramètres', order: 28 },
  // Activités
  { key: 'activities.view', label: "Voir le journal d'activité", group: 'Activités', order: 29 },
  // Statistiques
  { key: 'analytics.view', label: 'Voir les statistiques', group: 'Statistiques', order: 30 },
  // Administration
  { key: 'administration.manage', label: 'Gérer les utilisateurs et permissions', group: 'Administration', order: 31 },
]

/** Permissions activées par défaut pour chaque rôle, à la création d'un salon. */
export const DEFAULT_ROLE_PERMISSIONS: Record<RoleId, string[]> = {
  owner: PERMISSIONS_SEED.map(p => p.key),
  manager: PERMISSIONS_SEED
    .map(p => p.key)
    .filter(key => key !== 'administration.manage'),
  receptionist: [
    'bookings.view', 'bookings.create', 'bookings.edit',
    'orders.view', 'orders.create',
    'clients.view', 'clients.create', 'clients.edit',
    'payments.view',
    'settings.view',
    'activities.view',
  ],
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
  /** Permissions actuellement actives pour ce rôle. */
  permissionKeys: string[]
  /**
   * Toutes les clés du catalogue déjà "vues" pour ce rôle (actives ou
   * désactivées), utilisé pour ne compléter automatiquement que les clés
   * réellement nouvelles apparues dans `DEFAULT_ROLE_PERMISSIONS`, sans
   * jamais réactiver une permission que l'owner a explicitement décochée.
   */
  knownPermissionKeys?: string[]
  createdAt?: any
  updatedAt?: any
}

export type MemberStatus = 'active' | 'invited' | 'suspended'

/** Doc de la collection plate `salon_members`, scopée par `salonId`. */
export interface ISalonMember {
  id: string
  /** UID Firebase Auth du membre (docId = uid, comme pour `owners/{firebaseUid}`). */
  uid: string
  salonId: string
  name: string
  email: string
  roleId: RoleId
  status: MemberStatus
  /** Vrai tant que le membre n'a pas remplacé son mot de passe généré à la création. */
  mustChangePassword: boolean
  addedAt: string
  createdAt?: any
}
