'use client'
import React, { useState } from 'react'
import { Button } from '@zyra/ui/components/button'
import { Input } from '@zyra/ui/components/input'
import { usePermissionsUseCases } from '@/usecases/permissionsUseCases'
import ConfirmModal from '../CofirmModal'
import { IPermission } from '@zyra/conf/domain/entities/permissions.entities'
import { toast } from 'sonner'

export default function PermissionsManagement() {
  const {
    usePermissions,
    useSeedDefaultPermissions,
    useCreatePermission,
    useUpdatePermission,
    useDeletePermission,
  } = usePermissionsUseCases()

  const { data: permissions = [], isLoading } = usePermissions()
  const seedMutation = useSeedDefaultPermissions()
  const createMutation = useCreatePermission()
  const updateMutation = useUpdatePermission()
  const deleteMutation = useDeletePermission()

  const [form, setForm] = useState({ key: '', label: '', group: '' })
  const [editModal, setEditModal] = useState<{ open: boolean; permission: IPermission | null }>({ open: false, permission: null })
  const [editForm, setEditForm] = useState({ label: '', group: '' })
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; permission: IPermission | null }>({ open: false, permission: null })

  const handleSeed = () => {
    seedMutation.mutate(undefined, {
      onSuccess: () => toast.success('Permissions par défaut chargées avec succès'),
      onError: (error: any) => toast.error('Erreur lors du chargement : ' + error.message),
    })
  }

  const handleAdd = () => {
    const key = form.key.trim()
    const label = form.label.trim()
    const group = form.group.trim()
    if (!key || !label || !group) return
    if (permissions.some(p => p.key === key)) {
      toast.error('Cette clé de permission existe déjà.')
      return
    }
    createMutation.mutate({ key, label, group }, {
      onSuccess: () => toast.success('Permission ajoutée avec succès'),
      onError: (error: any) => toast.error('Erreur lors de l\'ajout : ' + error.message),
    })
    setForm({ key: '', label: '', group: '' })
  }

  const handleEdit = (permission: IPermission) => {
    setEditModal({ open: true, permission })
    setEditForm({ label: permission.label, group: permission.group })
  }

  const confirmEdit = () => {
    if (editModal.permission?.id && editForm.label.trim() && editForm.group.trim()) {
      updateMutation.mutate(
        { id: editModal.permission.id, data: { label: editForm.label.trim(), group: editForm.group.trim() } },
        {
          onSuccess: () => toast.success('Permission modifiée avec succès'),
          onError: (error: any) => toast.error('Erreur lors de la modification : ' + error.message),
        }
      )
    }
    setEditModal({ open: false, permission: null })
  }

  const handleDelete = (permission: IPermission) => setDeleteModal({ open: true, permission })

  const confirmDelete = () => {
    if (deleteModal.permission?.id) {
      deleteMutation.mutate(deleteModal.permission.id, {
        onSuccess: () => toast.success('Permission supprimée avec succès'),
        onError: (error: any) => toast.error('Erreur lors de la suppression : ' + error.message),
      })
    }
    setDeleteModal({ open: false, permission: null })
  }

  return (
    <div className="bg-white rounded shadow p-6 space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="font-bold text-2xl">Catalogue des permissions</h2>
          <p className="text-sm text-gray-600 mt-1">
            Ces permissions sont proposées à chaque salon pour configurer les rôles de son équipe
            (propriétaire, manager, réceptionniste, coiffeur).
          </p>
        </div>
        {!isLoading && permissions.length === 0 && (
          <Button type="button" variant="outline" onClick={handleSeed} disabled={seedMutation.isPending}>
            {seedMutation.isPending ? 'Chargement...' : 'Charger les permissions par défaut'}
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
        <Input
          value={form.key}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm(f => ({ ...f, key: e.target.value }))}
          placeholder="Clé (ex : bookings.manage)"
        />
        <Input
          value={form.label}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm(f => ({ ...f, label: e.target.value }))}
          placeholder="Libellé"
        />
        <Input
          value={form.group}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm(f => ({ ...f, group: e.target.value }))}
          placeholder="Groupe (ex : Réservations)"
        />
        <Button type="button" onClick={handleAdd} disabled={createMutation.isPending}>
          Ajouter
        </Button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full border text-sm">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-4 py-2 text-left">Clé</th>
              <th className="px-4 py-2 text-left">Libellé</th>
              <th className="px-4 py-2 text-left">Groupe</th>
              <th className="px-4 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={4} className="text-center py-6 text-gray-500">
                  Chargement...
                </td>
              </tr>
            ) : permissions.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center py-6 text-gray-500">
                  Aucune permission. Cliquez sur « Charger les permissions par défaut » pour commencer.
                </td>
              </tr>
            ) : (
              permissions.map(permission => (
                <tr key={permission.id} className="border-t">
                  <td className="px-4 py-2 font-mono text-xs">{permission.key}</td>
                  <td className="px-4 py-2">{permission.label}</td>
                  <td className="px-4 py-2">{permission.group}</td>
                  <td className="px-4 py-2 flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => handleEdit(permission)}>
                      Modifier
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(permission)}
                      disabled={deleteMutation.isPending}
                    >
                      Supprimer
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <ConfirmModal
        open={editModal.open}
        title="Modifier la permission"
        description={
          <div className="space-y-3">
            <Input
              value={editForm.label}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditForm(f => ({ ...f, label: e.target.value }))}
              placeholder="Libellé"
              autoFocus
            />
            <Input
              value={editForm.group}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditForm(f => ({ ...f, group: e.target.value }))}
              placeholder="Groupe"
            />
          </div>
        }
        onCancel={() => setEditModal({ open: false, permission: null })}
        onConfirm={confirmEdit}
        confirmLabel="Enregistrer"
        loading={updateMutation.isPending}
      />

      <ConfirmModal
        open={deleteModal.open}
        title="Supprimer la permission"
        description="Cette permission ne sera plus proposée aux salons pour configurer leurs rôles. Les salons qui l'avaient déjà activée pour un rôle la conserveront jusqu'à leur prochaine modification."
        onCancel={() => setDeleteModal({ open: false, permission: null })}
        onConfirm={confirmDelete}
        confirmLabel="Confirmer la suppression"
        loading={deleteMutation.isPending}
        confirmVariant="destructive"
      />
    </div>
  )
}
