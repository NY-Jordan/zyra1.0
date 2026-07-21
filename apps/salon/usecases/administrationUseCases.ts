'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { where } from 'firebase/firestore'
import {
  fetchCollection,
  createDocument,
  editDocument,
  deleteDocument,
  fetchSubCollection,
  updateSubCollectionDocument,
} from '@zyra/conf/lib/query'
import { seedSalonRolePermissions } from '@zyra/conf/lib/permissions'
import {
  IPermission,
  ISalonMember,
  ISalonRolePermissions,
  MemberStatus,
  PERMISSIONS_COLLECTION,
  PERMISSIONS_SEED,
  ROLE_PERMISSIONS_SUBCOLLECTION,
  SALON_MEMBERS_COLLECTION,
  RoleId,
  isPermissionLocked,
} from '@zyra/conf/domain/entities/permissions.entities'
import useSalon from '@/hooks/useSalon'

const FALLBACK_PERMISSIONS: IPermission[] = PERMISSIONS_SEED.map(p => ({ ...p, id: p.key }))

/** Catalogue global des permissions (seedé depuis l'app admin). */
export function usePermissionsCatalog() {
  return useQuery({
    queryKey: ['permissions-catalog'],
    queryFn: async () => {
      const data = (await fetchCollection(PERMISSIONS_COLLECTION)) as IPermission[]
      if (data.length === 0) return FALLBACK_PERMISSIONS
      return [...data].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    },
  })
}

/** Matrice rôles → permissions du salon courant (sous-collection `role_permissions`). */
export function useSalonRolePermissions() {
  const { salonId } = useSalon()
  const queryClient = useQueryClient()
  const queryKey = ['salon-role-permissions', salonId]

  const query = useQuery({
    queryKey,
    queryFn: async () => {
      if (!salonId) return {} as Record<RoleId, string[]>
      let docs = (await fetchSubCollection('salons', salonId, ROLE_PERMISSIONS_SUBCOLLECTION)) as ISalonRolePermissions[]
      if (docs.length === 0) {
        // Salon créé avant l'introduction de cette fonctionnalité : on seed à la volée.
        await seedSalonRolePermissions(salonId)
        docs = (await fetchSubCollection('salons', salonId, ROLE_PERMISSIONS_SUBCOLLECTION)) as ISalonRolePermissions[]
      }
      return docs.reduce((acc, doc) => {
        acc[doc.roleId] = doc.permissionKeys || []
        return acc
      }, {} as Record<RoleId, string[]>)
    },
    enabled: !!salonId,
  })

  const toggleMutation = useMutation({
    mutationFn: async ({ roleId, permissionKey }: { roleId: RoleId; permissionKey: string }) => {
      if (!salonId || isPermissionLocked(roleId, permissionKey)) return
      const docs = (await fetchSubCollection('salons', salonId, ROLE_PERMISSIONS_SUBCOLLECTION, [
        where('roleId', '==', roleId),
      ])) as ISalonRolePermissions[]
      const current = docs[0]?.permissionKeys || []
      const next = current.includes(permissionKey)
        ? current.filter(k => k !== permissionKey)
        : [...current, permissionKey]
      await updateSubCollectionDocument('salons', salonId, ROLE_PERMISSIONS_SUBCOLLECTION, roleId, {
        permissionKeys: next,
      })
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  })

  return {
    rolePermissions: query.data || ({} as Record<RoleId, string[]>),
    isLoading: query.isLoading,
    togglePermission: (roleId: RoleId, permissionKey: string) => toggleMutation.mutate({ roleId, permissionKey }),
  }
}

/** Membres et invitations du salon courant (collection plate `salon_members`). */
export function useSalonMembers() {
  const { salonId } = useSalon()
  const queryClient = useQueryClient()
  const queryKey = ['salon-members', salonId]
  const invalidate = () => queryClient.invalidateQueries({ queryKey })

  const query = useQuery({
    queryKey,
    queryFn: async () => {
      if (!salonId) return []
      return (await fetchCollection(SALON_MEMBERS_COLLECTION, [where('salonId', '==', salonId)])) as ISalonMember[]
    },
    enabled: !!salonId,
  })

  const inviteMutation = useMutation({
    mutationFn: async ({ name, email, roleId }: { name: string; email: string; roleId: RoleId }) => {
      if (!salonId) throw new Error('Salon non trouvé')
      return createDocument(SALON_MEMBERS_COLLECTION, {
        salonId,
        name,
        email,
        roleId,
        status: 'invited' as MemberStatus,
        addedAt: new Date().toISOString().slice(0, 10),
      })
    },
    onSuccess: invalidate,
  })

  const changeRoleMutation = useMutation({
    mutationFn: async ({ memberId, roleId }: { memberId: string; roleId: RoleId }) =>
      editDocument(SALON_MEMBERS_COLLECTION, memberId, { roleId }),
    onSuccess: invalidate,
  })

  const toggleStatusMutation = useMutation({
    mutationFn: async (member: ISalonMember) =>
      editDocument(SALON_MEMBERS_COLLECTION, member.id, {
        status: member.status === 'active' ? 'suspended' : 'active',
      }),
    onSuccess: invalidate,
  })

  const removeMutation = useMutation({
    mutationFn: async (memberId: string) => deleteDocument(SALON_MEMBERS_COLLECTION, memberId),
    onSuccess: invalidate,
  })

  return {
    members: query.data || [],
    isLoading: query.isLoading,
    inviteMember: (data: { name: string; email: string; roleId: RoleId }) => inviteMutation.mutate(data),
    changeMemberRole: (memberId: string, roleId: RoleId) => changeRoleMutation.mutate({ memberId, roleId }),
    toggleMemberStatus: (member: ISalonMember) => toggleStatusMutation.mutate(member),
    removeMember: (memberId: string) => removeMutation.mutate(memberId),
  }
}
