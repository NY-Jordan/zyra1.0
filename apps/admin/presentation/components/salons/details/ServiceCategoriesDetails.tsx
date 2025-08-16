'use client'
import { useState } from "react"
import { Button } from "@zyra/ui/components/button"
import { Pencil, Trash2, Plus } from "lucide-react"
import { editDocument } from "@zyra/conf/lib/query"
import { useQueryClient } from "@tanstack/react-query"
import { ISalon } from "@zyra/conf/domain/entities/salons.entities"
import { toast } from "sonner"
import ConfirmModal from "@/presentation/components/CofirmModal"

const generateId = () => Math.random().toString(36).substring(2, 12)

export default function ServiceCategoriesDetails({
  salon,
}: {
  salon: ISalon
}) {
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [categoryToEdit, setCategoryToEdit] = useState<any | null>(null)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [categoryToDelete, setCategoryToDelete] = useState<any | null>(null)
  const [newCategory, setNewCategory] = useState("")
  const [editCategoryName, setEditCategoryName] = useState("")
  const queryClient = useQueryClient()

  // Add category
  const handleAddCategory = async () => {
    if (!newCategory.trim()) return
    setLoading(true)
    try {
      const updatedCategories = [
        ...(salon.serviceCategories || []),
        { id: generateId(), name: newCategory }
      ]
      await editDocument("salons", salon.id, { serviceCategories: updatedCategories })
      queryClient.invalidateQueries({ queryKey: ['fetch-salon-details', salon.id] })
      toast.success("Catégorie ajoutée avec succès")
      setNewCategory("")
      setShowForm(false)
    } catch (e) {
      toast.error("Erreur lors de l'ajout")
    }
    setLoading(false)
  }

  // Edit category
  const handleEditCategory = async () => {
    if (!editCategoryName.trim() || !categoryToEdit) return
    setLoading(true)
    try {
      const updatedCategories = (salon.serviceCategories || []).map((cat: any) =>
        cat.id === categoryToEdit.id ? { ...cat, name: editCategoryName } : cat
      )
      await editDocument("salons", salon.id, { serviceCategories: updatedCategories })
      queryClient.invalidateQueries({ queryKey: ['fetch-salon-details', salon.id] })
      toast.success("Catégorie modifiée avec succès")
      setEditModalOpen(false)
      setCategoryToEdit(null)
      setEditCategoryName("")
    } catch (e) {
      toast.error("Erreur lors de la modification")
    }
    setLoading(false)
  }

  // Delete category
  const handleConfirmDelete = async () => {
    if (!categoryToDelete) return
    setLoading(true)
    try {
      const updatedCategories = (salon.serviceCategories || []).filter((cat: any) => cat.id !== categoryToDelete.id)
      await editDocument("salons", salon.id, { serviceCategories: updatedCategories })
      queryClient.invalidateQueries({ queryKey: ['fetch-salon-details', salon.id] })
      toast.success("Catégorie supprimée avec succès")
      setDeleteModalOpen(false)
      setCategoryToDelete(null)
    } catch (e) {
      toast.error("Erreur lors de la suppression")
    }
    setLoading(false)
  }

  return (
    <div className="mb-8 mt-5">
      <div className="flex items-center justify-between mb-2">
        <h2 className="font-semibold">Catégories de services</h2>
        <Button variant="default" onClick={() => setShowForm(v => !v)}>
          <Plus className="w-4 h-4 mr-1" /> Ajouter
        </Button>
      </div>
      {showForm && (
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            className="border rounded px-2 py-1 text-sm"
            placeholder="Nom de la catégorie"
            value={newCategory}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewCategory(e.target.value)}
            disabled={loading}
          />
          <Button variant="default" onClick={handleAddCategory} disabled={loading}>
            Ajouter
          </Button>
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm border">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-4 py-2 text-left">Nom</th>
              <th className="px-4 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {(salon.serviceCategories || []).map((cat: any, i: number) => (
              <tr key={cat.id || i} className="border-t">
                <td className="px-4 py-2">{cat.name}</td>
                <td className="px-4 py-2 flex gap-2">
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => {
                      setEditModalOpen(true)
                      setCategoryToEdit(cat)
                      setEditCategoryName(cat.name)
                    }}
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="destructive"
                    onClick={() => {
                      setDeleteModalOpen(true)
                      setCategoryToDelete(cat)
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </td>
              </tr>
            ))}
            {(salon.serviceCategories || []).length === 0 && (
              <tr>
                <td colSpan={2} className="text-center py-6 text-gray-500">Aucune catégorie.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {/* Edit Modal */}
      <ConfirmModal
        open={editModalOpen}
        title="Modifier la catégorie"
        description={
          <input
            type="text"
            className="border rounded px-2 py-1 text-sm w-full mb-3"
            value={editCategoryName}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditCategoryName(e.target.value)}
            disabled={loading}
          />
        }
        onCancel={() => setEditModalOpen(false)}
        onConfirm={handleEditCategory}
        confirmLabel="Enregistrer"
        loading={loading}
        confirmVariant="default"
      />
      {/* Delete Modal */}
      <ConfirmModal
        open={deleteModalOpen}
        title="Supprimer la catégorie"
        description="Voulez-vous vraiment supprimer cette catégorie ?"
        onCancel={() => setDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        confirmLabel="Supprimer"
        loading={loading}
        confirmVariant="destructive"
      />
    </div>
  )
}