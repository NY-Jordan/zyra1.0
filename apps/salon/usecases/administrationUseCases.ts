'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { where } from 'firebase/firestore'
import {
  fetchCollection,
  editDocument,
  fetchSubCollection,
  updateSubCollectionDocument,
  createSubCollectionDocument,
} from '@zyra/conf/lib/query'
import { seedSalonRolePermissions } from '@zyra/conf/lib/permissions'
import {
  IPermission,
  ISalonMember,
  ISalonRolePermissions,
  PERMISSIONS_COLLECTION,
  PERMISSIONS_SEED,
  ROLE_PERMISSIONS_SUBCOLLECTION,
  SALON_MEMBERS_COLLECTION,
  ROLE_IDS,
  DEFAULT_ROLE_PERMISSIONS,
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

      const byRole = docs.reduce((acc, doc) => {
        acc[doc.roleId] = doc.permissionKeys || []
        return acc
      }, {} as Record<RoleId, string[]>)

      // Clés déjà "vues" pour ce rôle (actives ou explicitement décochées).
      // Fallback sur permissionKeys pour les docs créés avant l'ajout de ce
      // champ : leurs clés déjà actives sont donc considérées comme connues.
      const knownByRole = docs.reduce((acc, doc) => {
        acc[doc.roleId] = doc.knownPermissionKeys || doc.permissionKeys || []
        return acc
      }, {} as Record<RoleId, string[]>)

      // Complète UNIQUEMENT avec les clés réellement nouvelles du catalogue
      // par défaut (jamais vues auparavant) — une permission déjà connue et
      // décochée par l'owner ne sera donc plus jamais recochée automatiquement.
      await Promise.all(
        ROLE_IDS.map(async roleId => {
          const currentActive = byRole[roleId] || []
          const known = knownByRole[roleId] || []
          const newlyKnown = (DEFAULT_ROLE_PERMISSIONS[roleId] || []).filter(k => !known.includes(k))
          if (newlyKnown.length === 0) return
          const nextActive = [...currentActive, ...newlyKnown]
          const nextKnown = [...known, ...newlyKnown]
          byRole[roleId] = nextActive
          const data = { permissionKeys: nextActive, knownPermissionKeys: nextKnown }
          if (docs.some(d => d.roleId === roleId)) {
            await updateSubCollectionDocument('salons', salonId, ROLE_PERMISSIONS_SUBCOLLECTION, roleId, data)
          } else {
            await createSubCollectionDocument(
              'salons', salonId, ROLE_PERMISSIONS_SUBCOLLECTION, { roleId, ...data }, roleId
            )
          }
        })
      )

      return byRole
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
      const known = docs[0]?.knownPermissionKeys || current
      const next = current.includes(permissionKey)
        ? current.filter(k => k !== permissionKey)
        : [...current, permissionKey]
      const nextKnown = known.includes(permissionKey) ? known : [...known, permissionKey]
      await updateSubCollectionDocument('salons', salonId, ROLE_PERMISSIONS_SUBCOLLECTION, roleId, {
        permissionKeys: next,
        knownPermissionKeys: nextKnown,
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
  const { salon, salonId } = useSalon()
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

  const addMemberMutation = useMutation({
    mutationFn: async ({
      name,
      email,
      roleId,
      sendCredentials,
    }: {
      name: string
      email: string
      roleId: RoleId
      sendCredentials: boolean
    }) => {
      if (!salonId) throw new Error('Salon non trouvé')
      const res = await fetch('/api/members/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ salonId, salonName: salon?.name, name, email, roleId, sendCredentials }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Erreur lors de la création du membre')
      return data as { id: string; password: string }
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
    mutationFn: async (member: ISalonMember) => {
      const res = await fetch('/api/members/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid: member.uid }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Erreur lors de la suppression du membre')
    },
    onSuccess: invalidate,
  })

  return {
    members: query.data || [],
    isLoading: query.isLoading,
    addMember: (data: { name: string; email: string; roleId: RoleId; sendCredentials: boolean }) =>
      addMemberMutation.mutateAsync(data),
    isAddingMember: addMemberMutation.isPending,
    changeMemberRole: (memberId: string, roleId: RoleId) => changeRoleMutation.mutate({ memberId, roleId }),
    toggleMemberStatus: (member: ISalonMember) => toggleStatusMutation.mutate(member),
    removeMember: (member: ISalonMember) => removeMutation.mutate(member),
  }
}
