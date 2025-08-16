'use client'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@zyra/ui/components/table"
import { IService } from "@zyra/conf/domain/entities/services.entities"
import { Button } from "@zyra/ui/components/button"
import { Pencil, Trash2, RefreshCw, Plus } from "lucide-react"
import { useState } from "react"
import ConfirmModal from "@/presentation/components/CofirmModal"
import { editDocument, deleteDocument, createDocument } from "@zyra/conf/lib/query"
import { useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import CreateServiceModal from '@/presentation/components/services/CreateServiceModal'

export default function ServicesList({ services, loading }: { services: IService[], loading: boolean }) {
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [serviceToEdit, setServiceToEdit] = useState<IService | null>(null)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [serviceToDelete, setServiceToDelete] = useState<IService | null>(null)
  const [toggleModalOpen, setToggleModalOpen] = useState(false)
  const [serviceToToggle, setServiceToToggle] = useState<IService | null>(null)
  const [editName, setEditName] = useState("")
  const [actionLoading, setActionLoading] = useState(false)
  const queryClient = useQueryClient()

  // Update service name
  const handleEditService = async () => {
    if (!serviceToEdit || !editName.trim()) return
    setActionLoading(true)
    try {
      await editDocument("services", serviceToEdit.id, { name: editName })
      queryClient.invalidateQueries({ queryKey: ['services-valid'] })
      queryClient.invalidateQueries({ queryKey: ['services-forbidden'] })
      toast.success("Service modifié avec succès")
      setEditModalOpen(false)
      setServiceToEdit(null)
      setEditName("")
    } catch (e) {
      toast.error("Erreur lors de la modification")
    }
    setActionLoading(false)
  }

  // Delete service
  const handleConfirmDelete = async () => {
    if (!serviceToDelete) return
    setActionLoading(true)
    try {
      await deleteDocument("services", serviceToDelete.id)
      queryClient.invalidateQueries({ queryKey: ['services-forbidden'] });
      queryClient.invalidateQueries({ queryKey: ['services-valid'] });
      toast.success("Service supprimé avec succès")
      setDeleteModalOpen(false)
      setServiceToDelete(null)
    } catch (e) {
      toast.error("Erreur lors de la suppression")
    }
    setActionLoading(false)
  }

  // Toggle status with confirmation
  const handleConfirmToggleStatus = async () => {
    if (!serviceToToggle) return
    setActionLoading(true)
    try {
      const newStatus = serviceToToggle.status ? false : true
      await editDocument("services", serviceToToggle.id, { status: newStatus })
      queryClient.invalidateQueries({ queryKey: ['services-forbidden'] });
      queryClient.invalidateQueries({ queryKey: ['services-valid'] });
      toast.success("Statut modifié")
      setToggleModalOpen(false)
      setServiceToToggle(null)
    } catch (e) {
      toast.error("Erreur lors du changement de statut")
    }
    setActionLoading(false)
  }

  

  return (
    <div className="bg-white rounded shadow p-4">
      
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nom</TableHead>
            <TableHead>Réservations</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center text-gray-500">Chargement...</TableCell>
            </TableRow>
          ) : services.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center text-gray-500">Aucun service trouvé.</TableCell>
            </TableRow>
          ) : (
            services.map((service: IService) => (
              <TableRow key={service.id}>
                <TableCell>{service.name}</TableCell>
                <TableCell>{service.reservations}</TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded text-xs ${service.status ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-600"}`}>
                    {service.status ? "Valide" : "Inactif"}
                  </span>
                </TableCell>
                <TableCell className="flex gap-2">
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => {
                      setEditModalOpen(true)
                      setServiceToEdit(service)
                      setEditName(service.name)
                    }}
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="destructive"
                    onClick={() => {
                      setDeleteModalOpen(true)
                      setServiceToDelete(service)
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="secondary"
                    onClick={() => {
                      setToggleModalOpen(true)
                      setServiceToToggle(service)
                    }}
                  >
                    <RefreshCw className="w-4 h-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      {/* Edit Modal */}
      <ConfirmModal
        open={editModalOpen}
        title="Modifier le service"
        description={
          <input
            type="text"
            className="border rounded px-2 py-1 text-sm w-full mb-3"
            value={editName}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditName(e.target.value)}
            disabled={actionLoading}
          />
        }
        onCancel={() => setEditModalOpen(false)}
        onConfirm={handleEditService}
        confirmLabel="Enregistrer"
        loading={actionLoading}
        confirmVariant="default"
      />
      {/* Delete Modal */}
      <ConfirmModal
        open={deleteModalOpen}
        title="Supprimer le service"
        description="Voulez-vous vraiment supprimer ce service ?"
        onCancel={() => setDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        confirmLabel="Supprimer"
        loading={actionLoading}
        confirmVariant="destructive"
      />
      {/* Toggle Status Modal */}
      <ConfirmModal
        open={toggleModalOpen}
        title="Changer le statut du service"
        description={`Voulez-vous vraiment ${serviceToToggle?.status ? "désactiver" : "activer"} ce service ?`}
        onCancel={() => setToggleModalOpen(false)}
        onConfirm={handleConfirmToggleStatus}
        confirmLabel={serviceToToggle?.status ? "Désactiver" : "Activer"}
        loading={actionLoading}
        confirmVariant="destructive"
      />
      
    </div>
  )
}