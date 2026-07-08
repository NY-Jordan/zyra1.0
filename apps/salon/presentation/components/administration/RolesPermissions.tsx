'use client'

import React from 'react'
import { Switch } from '@zyra/ui/components/switch'
import { ShieldCheck, Lock } from 'lucide-react'
import { PERMISSIONS, PERMISSION_GROUPS, ROLES, RoleId } from './types'

interface RolesPermissionsProps {
  rolePermissions: Record<RoleId, string[]>
  onTogglePermission: (roleId: RoleId, permissionKey: string) => void
}

const card = 'bg-white dark:bg-[#161B24] border border-[#F0EAE4] dark:border-slate-800/50 rounded-2xl'

export default function RolesPermissions({ rolePermissions, onTogglePermission }: RolesPermissionsProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {ROLES.map(role => {
        const activeKeys = rolePermissions[role.id] || []
        return (
          <div key={role.id} className={`${card} p-5`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-xl ${role.bg} flex items-center justify-center ${role.text} flex-shrink-0`}>
                  <ShieldCheck className="h-4.5 w-4.5" />
                </div>
                <div>
                  <p className="text-[14px] font-bold text-slate-800 dark:text-white">{role.label}</p>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500">{role.description}</p>
                </div>
              </div>
              {role.locked && (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full bg-[#F8F4F0] dark:bg-slate-800/40 text-slate-500 dark:text-slate-400 flex-shrink-0">
                  <Lock className="h-3 w-3" />
                  Verrouillé
                </span>
              )}
            </div>

            <div className="space-y-4">
              {PERMISSION_GROUPS.map(group => {
                const groupPermissions = PERMISSIONS.filter(p => p.group === group)
                return (
                  <div key={group}>
                    <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide mb-2">
                      {group}
                    </p>
                    <div className="space-y-2">
                      {groupPermissions.map(permission => {
                        const checked = activeKeys.includes(permission.key)
                        return (
                          <div
                            key={permission.key}
                            className="flex items-center justify-between gap-3 py-1"
                          >
                            <span className="text-[12.5px] text-slate-600 dark:text-slate-300">
                              {permission.label}
                            </span>
                            <Switch
                              checked={checked}
                              disabled={role.locked}
                              onCheckedChange={() => onTogglePermission(role.id, permission.key)}
                            />
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}
