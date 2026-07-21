'use client'

import React, { useMemo, useState } from 'react'
import { Input } from '@zyra/ui/components/input'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@zyra/ui/components/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@zyra/ui/components/select'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@zyra/ui/components/alert-dialog'
import {
  Search,
  UserPlus,
  Users,
  UserCheck,
  Clock,
  Mail,
  UserX,
  Trash2,
  ShieldCheck,
} from 'lucide-react'
import { useOwner } from '@/hooks/useOwner'
import useSalon from '@/hooks/useSalon'
import { usePermissionsCatalog, useSalonMembers, useSalonRolePermissions } from '@/usecases/administrationUseCases'
import InviteUserModal from './InviteUserModal'
import RolesPermissions from './RolesPermissions'
import { getRole, MemberStatus, RoleId, ROLES, TeamMember } from './types'

const card = 'bg-white dark:bg-[#161B24] border border-[#F0EAE4] dark:border-slate-800/50 rounded-2xl'

function KpiCard({ icon, label, value, bg, iconColor }: {
  icon: React.ReactNode; label: string; value: React.ReactNode; bg: string; iconColor: string
}) {
  return (
    <div className={`${bg} rounded-2xl p-4 flex items-center gap-3`}>
      <div className={`w-10 h-10 rounded-xl bg-white/70 dark:bg-black/20 flex items-center justify-center ${iconColor} flex-shrink-0`}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-[20px] font-extrabold text-slate-800 dark:text-white leading-none truncate">{value}</p>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-1">{label}</p>
      </div>
    </div>
  )
}

const STATUS_LABEL: Record<MemberStatus, string> = {
  active: 'Actif',
  invited: 'Invitation envoyée',
  suspended: 'Suspendu',
}

const STATUS_STYLE: Record<MemberStatus, string> = {
  active: 'bg-[#EEF8F0] dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400',
  invited: 'bg-[#FEF6EC] dark:bg-amber-950/20 text-amber-700 dark:text-amber-400',
  suspended: 'bg-[#FDEEF0] dark:bg-rose-950/20 text-rose-700 dark:text-rose-400',
}

function MemberCard({ member, locked, onChangeRole, onToggleStatus, onRemove }: {
  member: TeamMember
  locked?: boolean
  onChangeRole: (roleId: RoleId) => void
  onToggleStatus: () => void
  onRemove: () => void
}) {
  const role = getRole(member.roleId)

  return (
    <div className="bg-white dark:bg-[#161B24] border border-[#F0EAE4] dark:border-slate-800/50 rounded-2xl p-4 hover:shadow-md hover:border-emerald-200 dark:hover:border-emerald-800/50 transition-all">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-11 h-11 rounded-full bg-emerald-500 flex items-center justify-center text-white text-[15px] font-bold flex-shrink-0">
            {member.name.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-[14px] font-bold text-slate-800 dark:text-white truncate">{member.name}</p>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate">{member.email}</p>
          </div>
        </div>
        {!locked && (
          <button
            type="button"
            onClick={onRemove}
            aria-label="Retirer l'accès"
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/20 dark:hover:text-rose-400 transition-colors flex-shrink-0"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      <div className="mt-3 pt-3 border-t border-[#F0EAE4] dark:border-slate-800/50 flex items-center justify-between gap-2">
        {locked ? (
          <span className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full ${role.bg} ${role.text}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${role.dot}`} />
            {role.label}
          </span>
        ) : (
          <Select value={member.roleId} onValueChange={(v) => onChangeRole(v as RoleId)}>
            <SelectTrigger className={`h-8 w-fit min-w-[130px] rounded-full border-none px-2.5 py-1 text-[11px] font-bold [&>svg]:h-3 [&>svg]:w-3 ${role.bg} ${role.text}`}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ROLES.filter(r => !r.locked).map(r => (
                <SelectItem key={r.id} value={r.id}>{r.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${STATUS_STYLE[member.status]}`}>
          {STATUS_LABEL[member.status]}
        </span>
      </div>

      {!locked && (
        <div className="mt-3 pt-3 border-t border-[#F0EAE4] dark:border-slate-800/50 flex justify-center">
          {member.status === 'invited' ? (
            <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
              <Mail className="h-3.5 w-3.5" />
              En attente de réponse
            </span>
          ) : (
            <button
              type="button"
              onClick={onToggleStatus}
              className="inline-flex items-center gap-1.5 text-[11px] font-bold px-3 py-1.5 rounded-full border border-[#E8E0D8] dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-[#F5F2EF] dark:hover:bg-slate-800 transition-colors"
            >
              {member.status === 'active' ? (
                <>
                  <UserX className="h-3.5 w-3.5" />
                  Suspendre l'accès
                </>
              ) : (
                <>
                  <UserCheck className="h-3.5 w-3.5" />
                  Réactiver l'accès
                </>
              )}
            </button>
          )}
        </div>
      )}
    </div>
  )
}

export default function AdministrationManagement() {
  const { owner } = useOwner()
  const { salon } = useSalon()
  const { data: permissionsCatalog = [] } = usePermissionsCatalog()
  const { rolePermissions, togglePermission } = useSalonRolePermissions()
  const {
    members,
    isLoading: membersLoading,
    inviteMember,
    changeMemberRole,
    toggleMemberStatus,
    removeMember,
  } = useSalonMembers()
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState<'all' | RoleId>('all')
  const [inviteModalOpen, setInviteModalOpen] = useState(false)
  const [memberToRemove, setMemberToRemove] = useState<TeamMember | null>(null)

  const ownerMember: TeamMember = {
    id: 'owner',
    salonId: salon?.id || '',
    name: owner?.name || 'Vous',
    email: owner?.email || '—',
    roleId: 'owner',
    status: 'active',
    addedAt: '—',
  }

  const statistics = useMemo(() => {
    const total = members.length + 1
    const active = members.filter(m => m.status === 'active').length + 1
    const pending = members.filter(m => m.status === 'invited').length
    return { total, active, pending }
  }, [members])

  const filteredMembers = useMemo(() => {
    return members.filter(member => {
      const term = searchTerm.toLowerCase()
      const matchesSearch =
        member.name.toLowerCase().includes(term) || member.email.toLowerCase().includes(term)
      const matchesRole = roleFilter === 'all' || member.roleId === roleFilter
      return matchesSearch && matchesRole
    })
  }, [members, searchTerm, roleFilter])

  const handleInvite = ({ name, email, roleId }: { name: string; email: string; roleId: RoleId }) => {
    inviteMember({ name, email, roleId })
  }

  const handleChangeRole = (memberId: string, roleId: RoleId) => {
    changeMemberRole(memberId, roleId)
  }

  const handleToggleStatus = (memberId: string) => {
    const member = members.find(m => m.id === memberId)
    if (member) toggleMemberStatus(member)
  }

  const confirmRemove = () => {
    if (!memberToRemove) return
    removeMember(memberToRemove.id)
    setMemberToRemove(null)
  }

  const handleTogglePermission = (roleId: RoleId, permissionKey: string) => {
    togglePermission(roleId, permissionKey)
  }

  if (membersLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4" />
          <p className="text-slate-400 dark:text-slate-500 text-sm">Chargement de l'équipe...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[22px] font-extrabold text-slate-800 dark:text-white tracking-tight">Administration</h1>
          <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5">
            Gérez les membres de votre équipe et leurs accès
          </p>
        </div>
        <button
          type="button"
          onClick={() => setInviteModalOpen(true)}
          className="flex items-center gap-1.5 h-10 px-4 rounded-xl text-[13px] font-bold text-white bg-emerald-500 hover:bg-emerald-600 shadow-lg shadow-emerald-500/20 transition-colors"
        >
          <UserPlus className="h-4 w-4" />
          Inviter un membre
        </button>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <KpiCard
          icon={<Users className="h-5 w-5" />} label="Membres de l'équipe"
          value={statistics.total}
          bg="bg-[#ECF6FE] dark:bg-sky-950/20" iconColor="text-sky-600"
        />
        <KpiCard
          icon={<ShieldCheck className="h-5 w-5" />} label="Accès actifs"
          value={statistics.active}
          bg="bg-[#EEF8F0] dark:bg-emerald-950/20" iconColor="text-emerald-600"
        />
        <KpiCard
          icon={<Clock className="h-5 w-5" />} label="Invitations en attente"
          value={statistics.pending}
          bg="bg-[#FEF6EC] dark:bg-amber-950/20" iconColor="text-amber-600"
        />
      </div>

      <Tabs defaultValue="members">
        <TabsList className="bg-[#F8F4F0] dark:bg-slate-800/50 rounded-xl p-1 h-auto">
          <TabsTrigger value="members" className="rounded-lg text-[12.5px] font-semibold px-3 py-1.5 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900">
            Membres
          </TabsTrigger>
          <TabsTrigger value="roles" className="rounded-lg text-[12.5px] font-semibold px-3 py-1.5 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900">
            Rôles & permissions
          </TabsTrigger>
        </TabsList>

        <TabsContent value="members" className="mt-4 space-y-4">
          {/* Recherche et filtre */}
          <div className={`${card} p-4 flex flex-col sm:flex-row gap-3`}>
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Rechercher par nom ou e-mail..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 h-10 rounded-xl border-[#E8E0D8] dark:border-slate-700"
              />
            </div>
            <Select value={roleFilter} onValueChange={(v) => setRoleFilter(v as 'all' | RoleId)}>
              <SelectTrigger className="h-10 sm:w-52 rounded-xl border-[#E8E0D8] dark:border-slate-700">
                <SelectValue placeholder="Tous les rôles" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les rôles</SelectItem>
                {ROLES.map(role => (
                  <SelectItem key={role.id} value={role.id}>{role.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Liste des membres */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <MemberCard
              member={ownerMember}
              locked
              onChangeRole={() => {}}
              onToggleStatus={() => {}}
              onRemove={() => {}}
            />
            {filteredMembers.map(member => (
              <MemberCard
                key={member.id}
                member={member}
                onChangeRole={(roleId) => handleChangeRole(member.id, roleId)}
                onToggleStatus={() => handleToggleStatus(member.id)}
                onRemove={() => setMemberToRemove(member)}
              />
            ))}
          </div>

          {filteredMembers.length === 0 && searchTerm && (
            <div className={`text-center py-10 ${card}`}>
              <Users className="h-9 w-9 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
              <p className="text-[13px] text-slate-400">Aucun membre ne correspond à votre recherche.</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="roles" className="mt-4">
          <RolesPermissions
            permissions={permissionsCatalog}
            rolePermissions={rolePermissions}
            onTogglePermission={handleTogglePermission}
          />
        </TabsContent>
      </Tabs>

      {/* Invitation */}
      <InviteUserModal open={inviteModalOpen} onOpenChange={setInviteModalOpen} onInvite={handleInvite} />

      {/* Confirmation de retrait */}
      <AlertDialog open={!!memberToRemove} onOpenChange={(o) => { if (!o) setMemberToRemove(null) }}>
        <AlertDialogContent className="rounded-2xl border-[#F0EAE4] dark:border-slate-800/50">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[16px] font-extrabold text-slate-800 dark:text-white">
              Retirer l'accès de ce membre ?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-[13px]">
              <strong>{memberToRemove?.name}</strong> perdra immédiatement l'accès à votre espace salon.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl text-[12px]">Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmRemove}
              className="rounded-xl text-[12px] bg-rose-600 hover:bg-rose-700 focus:ring-rose-600"
            >
              Retirer l'accès
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
