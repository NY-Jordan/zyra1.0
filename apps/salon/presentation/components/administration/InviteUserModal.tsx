'use client'

import React, { useState } from 'react'
import { Dialog, DialogContent, DialogTitle } from '@zyra/ui/components/dialog'
import { Input } from '@zyra/ui/components/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@zyra/ui/components/select'
import { UserPlus, Send, X } from 'lucide-react'
import { ROLES, RoleId } from './types'

interface InviteUserModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onInvite: (data: { name: string; email: string; roleId: RoleId }) => void
}

function FieldLabel({ children, htmlFor }: { children: React.ReactNode; htmlFor?: string }) {
  return (
    <label htmlFor={htmlFor} className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide block mb-1.5">
      {children}
    </label>
  )
}

const assignableRoles = ROLES.filter(r => !r.locked)

export default function InviteUserModal({ open, onOpenChange, onInvite }: InviteUserModalProps) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [roleId, setRoleId] = useState<RoleId>(assignableRoles[0].id)

  const handleClose = () => {
    setName('')
    setEmail('')
    setRoleId(assignableRoles[0].id)
    onOpenChange(false)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !email.trim()) return
    onInvite({ name: name.trim(), email: email.trim(), roleId })
    handleClose()
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) handleClose() }}>
      <DialogContent className="rounded-2xl border-[#F0EAE4] dark:border-slate-800/50 sm:max-w-[420px]">
        <button
          type="button"
          onClick={handleClose}
          className="absolute right-4 top-4 w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:bg-[#F5F2EF] hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-xl bg-[#EEF8F0] dark:bg-emerald-950/20 flex items-center justify-center text-emerald-600 flex-shrink-0">
            <UserPlus className="h-5 w-5" />
          </div>
          <DialogTitle className="text-[16px] font-extrabold text-slate-800 dark:text-white">
            Inviter un membre
          </DialogTitle>
        </div>
        <p className="text-[12px] text-slate-500 dark:text-slate-400 mb-4">
          Un accès sera créé pour cette personne selon le rôle choisi.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <FieldLabel htmlFor="member-name">Nom complet</FieldLabel>
            <Input
              id="member-name"
              placeholder="Ex : Awa Diallo"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-10 rounded-xl border-[#E8E0D8] dark:border-slate-700"
              required
            />
          </div>

          <div>
            <FieldLabel htmlFor="member-email">Adresse e-mail</FieldLabel>
            <Input
              id="member-email"
              type="email"
              placeholder="exemple@domaine.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-10 rounded-xl border-[#E8E0D8] dark:border-slate-700"
              required
            />
          </div>

          <div>
            <FieldLabel htmlFor="member-role">Rôle</FieldLabel>
            <Select value={roleId} onValueChange={(v) => setRoleId(v as RoleId)}>
              <SelectTrigger id="member-role" className="h-10 rounded-xl border-[#E8E0D8] dark:border-slate-700">
                <SelectValue placeholder="Sélectionner un rôle" />
              </SelectTrigger>
              <SelectContent>
                {assignableRoles.map(role => (
                  <SelectItem key={role.id} value={role.id}>
                    {role.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1.5">
              {ROLES.find(r => r.id === roleId)?.description}
            </p>
          </div>

          <button
            type="submit"
            className="w-full flex items-center justify-center gap-1.5 h-11 rounded-xl text-[13px] font-bold text-white bg-emerald-500 hover:bg-emerald-600 shadow-lg shadow-emerald-500/20 transition-colors"
          >
            <Send className="h-4 w-4" />
            Envoyer l'invitation
          </button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
