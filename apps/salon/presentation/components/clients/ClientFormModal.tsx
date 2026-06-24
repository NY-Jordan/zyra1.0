'use client'

import React, { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@zyra/ui/components/dialog'
import { Input } from '@zyra/ui/components/input'
import {
  User,
  Plus,
  Loader2,
  X,
} from 'lucide-react'
import { useSalon } from '@/hooks/useSalon'
import { useCreateClient, useUpdateClient } from '@/usecases/clientsUseCases'
import { IClient } from '@zyra/conf/domain/entities/clients.entities'
import { getPhonePrefix } from '@/utils/phonePrefix'

interface ClientFormModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  client?: IClient | null
}

function FieldLabel({ children, htmlFor }: { children: React.ReactNode; htmlFor?: string }) {
  return (
    <label htmlFor={htmlFor} className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide block mb-1.5">
      {children}
    </label>
  )
}

export default function ClientFormModal({ open, onOpenChange, client }: ClientFormModalProps) {
  const { salon } = useSalon()
  const createClientMutation = useCreateClient()
  const updateClientMutation = useUpdateClient()

  const phonePrefix = getPhonePrefix(salon?.country ?? '')

  const [formData, setFormData] = useState({
    name: client?.name || '',
    phone: client?.phone || '',
    email: client?.email || '',
  })

  React.useEffect(() => {
    if (client) {
      setFormData({ name: client.name, phone: client.phone, email: client.email || '' })
    } else {
      setFormData({ name: '', phone: phonePrefix, email: '' })
    }
  }, [client, open])

  const handleClose = () => {
    setFormData({ name: '', phone: '', email: '' })
    onOpenChange(false)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || !formData.phone) return

    if (client) {
      updateClientMutation.mutate(
        {
          clientId: client.id,
          data: { name: formData.name, phone: formData.phone, email: formData.email || null },
        },
        { onSuccess: () => handleClose() }
      )
    } else {
      createClientMutation.mutate(
        {
          salonId: salon?.id || '',
          name: formData.name,
          phone: formData.phone,
          email: formData.email || null,
          history: [],
        },
        { onSuccess: () => handleClose() }
      )
    }
  }

  const isLoading = createClientMutation.isPending || updateClientMutation.isPending

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) handleClose() }}>
      <DialogContent
        showCloseButton={false}
        className="sm:max-w-md p-0 overflow-hidden bg-white dark:bg-[#161B24] border border-[#F0EAE4] dark:border-slate-800/50 rounded-2xl gap-0"
      >
        <DialogTitle className="sr-only">{client ? 'Modifier le client' : 'Nouveau client'}</DialogTitle>

        <form onSubmit={handleSubmit}>
          {/* Header */}
          <div className="px-6 pt-6 pb-4 border-b border-[#F0EAE4] dark:border-slate-800/50">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/20 flex-shrink-0">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-[16px] font-extrabold text-slate-800 dark:text-white leading-tight">
                    {client ? 'Modifier le client' : 'Nouveau client'}
                  </h2>
                  <p className="text-[12px] text-slate-400 mt-0.5">
                    {client ? 'Mettez à jour les informations du client.' : 'Ajoutez un nouveau client régulier.'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleClose}
                className="w-7 h-7 rounded-full bg-[#F5F2EF] dark:bg-slate-700 flex items-center justify-center text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors flex-shrink-0"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="px-6 py-5 space-y-4">
            <div>
              <FieldLabel htmlFor="clientName">Nom complet *</FieldLabel>
              <Input
                id="clientName"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Ex: Jean Dupont"
                className="h-10 rounded-xl border-[#E8E0D8] dark:border-slate-700"
                required
              />
            </div>

            <div>
              <FieldLabel htmlFor="clientPhone">Téléphone *</FieldLabel>
              <Input
                id="clientPhone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="Ex: +237 6XX XX XX XX"
                className="h-10 rounded-xl border-[#E8E0D8] dark:border-slate-700"
                required
              />
            </div>

            <div>
              <FieldLabel htmlFor="clientEmail">Email (optionnel)</FieldLabel>
              <Input
                id="clientEmail"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="Ex: jean@example.com"
                className="h-10 rounded-xl border-[#E8E0D8] dark:border-slate-700"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-2 px-6 py-4 border-t border-[#F0EAE4] dark:border-slate-800/50 bg-[#FAF7F4] dark:bg-slate-800/30">
            <button
              type="button"
              onClick={handleClose}
              disabled={isLoading}
              className="h-9 px-5 rounded-xl text-[12px] font-bold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 border border-[#E8E0D8] dark:border-slate-700 hover:bg-[#F5F2EF] dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center gap-1.5 h-9 px-5 rounded-xl text-[12px] font-bold text-white bg-emerald-500 hover:bg-emerald-600 transition-colors disabled:opacity-60"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  {client ? 'Mise à jour...' : 'Création...'}
                </>
              ) : (
                <>
                  <Plus className="h-3.5 w-3.5" />
                  {client ? 'Mettre à jour' : 'Créer le client'}
                </>
              )}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
