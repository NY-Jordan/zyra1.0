import {
  RoleId,
  ROLES as ROLES_BASE,
  ISalonMember,
  MemberStatus,
  isPermissionLocked,
} from '@zyra/conf/domain/entities/permissions.entities'

export type { RoleId, MemberStatus }
export { isPermissionLocked }

export interface Role {
  id: RoleId
  label: string
  description: string
  bg: string
  text: string
  dot: string
  locked?: boolean
}

const ROLE_STYLES: Record<RoleId, Pick<Role, 'bg' | 'text' | 'dot'>> = {
  owner: {
    bg: 'bg-[#EEF8F0] dark:bg-emerald-950/20',
    text: 'text-emerald-700 dark:text-emerald-400',
    dot: 'bg-emerald-500',
  },
  manager: {
    bg: 'bg-[#F2EDFE] dark:bg-violet-950/20',
    text: 'text-violet-700 dark:text-violet-400',
    dot: 'bg-violet-500',
  },
  receptionist: {
    bg: 'bg-[#ECF6FE] dark:bg-sky-950/20',
    text: 'text-sky-700 dark:text-sky-400',
    dot: 'bg-sky-500',
  },
  hairdresser: {
    bg: 'bg-[#FEF6EC] dark:bg-amber-950/20',
    text: 'text-amber-700 dark:text-amber-400',
    dot: 'bg-amber-500',
  },
}

export const ROLES: Role[] = ROLES_BASE.map(role => ({ ...role, ...ROLE_STYLES[role.id] }))

export const getRole = (roleId: RoleId) => ROLES.find(r => r.id === roleId)!

export type TeamMember = ISalonMember
