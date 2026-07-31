import {
  DEFAULT_ROLE_PERMISSIONS,
  ROLE_PERMISSIONS_SUBCOLLECTION,
  type ISalonRolePermissions,
  type RoleId,
} from '@zyra/conf/domain/entities/permissions.entities';

import { fetchSubCollection } from '@/lib/query';

export const permissionsService = {
  /**
   * Reads the `salons/{salonId}/role_permissions` matrix (same shape the web
   * app manages from Administration). Falls back to the catalog defaults for
   * any role that hasn't been customized yet — mobile only reads this matrix,
   * the web app owns seeding/writing it.
   */
  async getRolePermissions(salonId: string): Promise<Record<RoleId, string[]>> {
    const docs = (await fetchSubCollection(
      'salons',
      salonId,
      ROLE_PERMISSIONS_SUBCOLLECTION
    )) as ISalonRolePermissions[];

    const byRole = { ...DEFAULT_ROLE_PERMISSIONS };
    docs.forEach((doc) => {
      byRole[doc.roleId] = doc.permissionKeys ?? DEFAULT_ROLE_PERMISSIONS[doc.roleId];
    });
    return byRole;
  },
};
