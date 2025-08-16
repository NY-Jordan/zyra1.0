'use client'
import React, { useState } from 'react'
import { Button } from '@zyra/ui/components/button'
import { Input } from '@zyra/ui/components/input'
import { useSalonCategories } from '@/usecases/useSalonCategories'
import ConfirmModal from '../CofirmModal'
import { toast } from 'sonner'

type Category = {
  id: string
  name: string
  active: boolean
}

export default function Categories() {
  const {
    categories,
    isLoading,
    addCategory,
    toggleCategory,
    deleteCategory,
    updateCategory,
    addPending,
    togglePending,
    deletePending,
    updatePending,
  } = useSalonCategories()

  const [newCategory, setNewCategory] = useState('')
  const [editModal, setEditModal] = useState<{ open: boolean; cat: Category | null }>({ open: false, cat: null })
  const [editName, setEditName] = useState('')
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; id: string | null }>({ open: false, id: null })
  const [toggleModal, setToggleModal] = useState<{ open: boolean; cat: Category | null }>({ open: false, cat: null })

  const handleAdd = () => {
    if (!newCategory.trim()) return
    if (categories.some(c => c.name.toLowerCase() === newCategory.trim().toLowerCase())) {
        toast.error("Cette catégorie existe déjà.")
        return
    }
    addCategory(newCategory.trim())
    setNewCategory('');
    toast.success('La catégorie a été ajoutée avec succès');
  }

  const handleEdit = (cat: Category) => {
    setEditModal({ open: true, cat })
    setEditName(cat.name)
  }

  const confirmEdit = () => {
    if (editModal.cat && editName.trim()) {
      updateCategory(editModal.cat.id, editName.trim())
      toast.success('La catégorie a été modifiée avec succès')
    }
    setEditModal({ open: false, cat: null })
    setEditName('')
  }

  const handleDelete = (id: string) => {
    setDeleteModal({ open: true, id })
  }

  const confirmDelete = () => {
    if (deleteModal.id) {
      deleteCategory(deleteModal.id);
      toast.success('La catégorie a été supprimée avec succès');
    }
    setDeleteModal({ open: false, id: null })
  }

  const handleToggle = (cat: Category) => {
    setToggleModal({ open: true, cat })
  }

  const confirmToggle = () => {
    if (toggleModal.cat) {
      toggleCategory(toggleModal.cat);
      toast.success('La catégorie a été modifiée avec succès');
    }
    setToggleModal({ open: false, cat: null })
  }

  return (
    <div className="bg-white rounded shadow p-6 space-y-6">
      <h2 className="font-bold text-2xl mb-4">Salon categories</h2>
      <div className="flex gap-2 mb-4">
        <Input
          value={newCategory}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewCategory(e.target.value)}
          placeholder="Add a category"
          className="w-64"
        />
        <Button type="button" onClick={handleAdd} disabled={addPending}>
          Add
        </Button>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full border text-sm">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-4 py-2 text-left">Name</th>
              <th className="px-4 py-2 text-left">Status</th>
              <th className="px-4 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={3} className="text-center py-6 text-gray-500">
                  Loading...
                </td>
              </tr>
            ) : categories.length === 0 ? (
              <tr>
                <td colSpan={3} className="text-center py-6 text-gray-500">
                  No categories found.
                </td>
              </tr>
            ) : (
              categories.map((cat: Category) => (
                <tr key={cat.id} className="border-t">
                  <td className="px-4 py-2">{cat.name}</td>
                  <td className="px-4 py-2">
                    {cat.active ? (
                      <span className="text-green-600 font-semibold">Active</span>
                    ) : (
                      <span className="text-gray-400">Inactive</span>
                    )}
                  </td>
                  <td className="px-4 py-2 flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(cat)}
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant={cat.active ? "outline" : "default"}
                      onClick={() => handleToggle(cat)}
                      disabled={togglePending}
                    >
                      {cat.active ? "Deactivate" : "Activate"}
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(cat.id)}
                      disabled={deletePending}
                    >
                      Delete
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
        title="Modifier la catégorie"
        description={
          <div>
            <Input
              value={editName}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditName(e.target.value)}
              placeholder="Category name"
              className="w-full"
              autoFocus
            />
          </div>
        }
        onCancel={() => {
          setEditModal({ open: false, cat: null })
          setEditName('')
        }}
        onConfirm={confirmEdit}
        confirmLabel="Enregistrer"
        loading={updatePending}
        confirmVariant="default"
      />

      <ConfirmModal
        open={deleteModal.open}
        title="Supprimer la catégorie"
        description="Cette catégorie de salon ne sera plus disponible sur la plateforme et les salons associés seront non catégorisés."
        onCancel={() => setDeleteModal({ open: false, id: null })}
        onConfirm={confirmDelete}
        confirmLabel="Confirmer la suppression"
        loading={deletePending}
        confirmVariant="destructive"
      />

      <ConfirmModal
        open={toggleModal.open}
        title={
          toggleModal.cat?.active
            ? 'Désactiver la catégorie'
            : 'Activer la catégorie'
        }
        description={
          toggleModal.cat?.active
            ? 'Cette catégorie sera masquée pour les salons et les clients.'
            : 'Cette catégorie sera disponible pour les salons et les clients.'
        }
        onCancel={() => setToggleModal({ open: false, cat: null })}
        onConfirm={confirmToggle}
        confirmLabel="Confirmer"
        loading={togglePending}
        confirmVariant={toggleModal.cat?.active ? 'destructive' : 'default'}
      />
    </div>
  )
}
