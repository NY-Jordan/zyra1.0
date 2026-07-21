import { createSubCollectionDocument } from './query'
import { DEFAULT_ROLE_PERMISSIONS, ROLES, ROLE_PERMISSIONS_SUBCOLLECTION } from '../domain/entities/permissions.entities'

/**
 * Associe à un salon sa matrice rôles → permissions par défaut, juste après
 * sa création (`salons/{salonId}/role_permissions/{roleId}`).
 */
export async function seedSalonRolePermissions(salonId: string): Promise<void> {
  await Promise.all(
    ROLES.map(role =>
      createSubCollectionDocument(
        'salons',
        salonId,
        ROLE_PERMISSIONS_SUBCOLLECTION,
        { roleId: role.id, permissionKeys: DEFAULT_ROLE_PERMISSIONS[role.id] },
        role.id
      )
    )
  )
}
