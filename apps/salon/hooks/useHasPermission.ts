'use client'
import { useSalonMember } from './useSalonMember'
import { useSalonRolePermissions } from '@/usecases/administrationUseCases'

/**
 * Centralise la vérification "l'utilisateur connecté a-t-il telle permission ?"
 * L'owner a toujours accès à tout ; un membre dépend de la matrice
 * `role_permissions` du salon pour son rôle.
 */
export function useHasPermission() {
  const { member, isLoading: memberLoading } = useSalonMember()
  const { rolePermissions, isLoading: permsLoading } = useSalonRolePermissions()

  const hasPermission = (key: string): boolean => {
    if (!member) return true
    return (rolePermissions[member.roleId] || []).includes(key)
  }

  return {
    hasPermission,
    isOwner: !member,
    isLoading: memberLoading || permsLoading,
  }
}

export default useHasPermission
