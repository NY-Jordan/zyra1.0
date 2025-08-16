'use client'
import { Button } from '@zyra/ui/components/button'
import { Pencil, Plus, Trash2, Eye } from 'lucide-react'
import React, { useState } from 'react'
import CreateServiceModal from './CreateServiceModal'
import SalonServiceDetailsModal from './SalonServiceDetailsModal'
import DeleteServiceModal from './DeleteServiceModal'
import EditServiceModal from './EditServiceModal'
import { editDocument } from '@zyra/conf/lib/query'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { useQueryClient } from '@tanstack/react-query'
import { uploadLogoFile } from '@zyra/conf/lib/utils'
import { ISalon, ISalonService } from '@zyra/conf/domain/entities/salons.entities'
import Categories from '../../../settings/Categories';
import { log } from 'console'


function generateUniqueId() {
  return Math.random().toString(36).substr(2, 16) + Date.now().toString(36)
}

export default function ServiceDetails({ services, salon }: { services: ISalonService[], salon: ISalon }) {
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [selectedService, setSelectedService] = useState<any | null>(null)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [serviceToDelete, setServiceToDelete] = useState<any | null>(null)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [serviceToEdit, setServiceToEdit] = useState<any | null>(null)
  const router = useRouter()
  const queryClient = useQueryClient()


  const handleAddService = async (data: any) => {
    setLoading(true)
    try {
      let imageUrl = undefined
      if (data.image && data.image instanceof File) {
        imageUrl = await uploadLogoFile(`salons/${salon.id}/services`, data.image)
      }
      const { image,  ...serviceData } = data
      const newServices = [
        ...(services || []),
        { id: generateUniqueId(), ...imageUrl ? { ...serviceData, imageUrl } : serviceData }
      ]
      await editDocument("salons", salon.id, { services: newServices })
      queryClient.invalidateQueries({ queryKey: ['fetch-salon-details', salon.id] })
      toast.success("Service ajouté avec succès")
    } catch (e) {
      toast.error("Erreur lors de l'ajout du service")
    }
    setLoading(false)
    setShowForm(false)
  }

  const handleDeleteClick = (service: any) => {
    setServiceToDelete(service)
    setDeleteModalOpen(true)
  }

  const handleConfirmDelete = async () => {
    setLoading(true)
    try {
      const updatedServices = (services || []).filter((s: any) => s !== serviceToDelete)
      await editDocument("salons", salon.id, { services: updatedServices })
      queryClient.invalidateQueries({ queryKey: ['fetch-salon-details', salon.id] })
      toast.success("Service supprimé avec succès")
    } catch (e) {
      toast.error("Erreur lors de la suppression du service")
    }
    setLoading(false)
    setDeleteModalOpen(false)
    setServiceToDelete(null)
  }

  const handleEditClick = (service: any) => {
    setServiceToEdit(service)
    setEditModalOpen(true)
  }

  const handleEditService = async (data: any) => {
    setLoading(true)
    try {
      let imageUrl = serviceToEdit?.imageUrl
      if (data.image && data.image instanceof File) {
        imageUrl = await uploadLogoFile(`salons/${salon.id}/services`, data.image)
      }
      const { image, ...serviceData } = data
      // remove old service and add modified one
      const updatedServices = (services || []).map((s: any) =>
        s === serviceToEdit
          ? (imageUrl ? { ...serviceData, imageUrl } : serviceData)
          : s
      )
      await editDocument("salons", salon.id, { services: updatedServices })
      queryClient.invalidateQueries({ queryKey: ['fetch-salon-details', salon.id] })
      toast.success("Service modifié avec succès")
    } catch (e) {
      toast.error("Erreur lors de la modification du service")
    }
    setLoading(false)
    setEditModalOpen(false)
    setServiceToEdit(null)
  }

  return (
    <div className="mb-8 mt-5">
      <div className="flex items-center justify-between mb-2">
        <h2 className="font-semibold">Services proposés</h2>
        <Button variant="default" onClick={() => setShowForm(v => !v)}>
          <Plus className="w-4 h-4 mr-1" /> Ajouter
        </Button>
      </div>
      <CreateServiceModal
        open={showForm}
        serviceCategories={salon.serviceCategories}
        onClose={() => setShowForm(false)}
        onSubmit={handleAddService}
        loading={loading}
      />
      <EditServiceModal
        open={editModalOpen}
        onClose={() => { setEditModalOpen(false); setServiceToEdit(null) }}
        onSubmit={handleEditService}
        loading={loading}
        serviceCategories={salon.serviceCategories}
        initialData={serviceToEdit}
      />
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm border">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-4 py-2 text-left">Service</th>
              <th className="px-4 py-2 text-left">Prix</th>
              <th className="px-4 py-2 text-left">Categorie</th>
              <th className="px-4 py-2 text-left">Durée</th>
              <th className="px-4 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {(services || []).map((s: ISalonService, i: number) => (
              <tr key={i} className="border-t">
                <td className="px-4 py-2 flex items-center gap-2">
                  {s.imageUrl && (
                    <img src={s.imageUrl} alt="" className="w-8 h-8 object-cover rounded" />
                  )}
                  {s.name}
                </td>
                <td className="px-4 py-2 text-blue-600 font-semibold">{s.price}</td>
                <td className="px-4 py-2  font-semibold">{salon.serviceCategories.find(cat => cat.id ===  s.categoryId)?.name || ''}</td>
                <td className="px-4 py-2">{s.duration}</td>
                <td className="px-4 py-2 flex gap-2">
                  <Button size="icon" variant="outline" onClick={() => handleEditClick(s)}>
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button size="icon" variant="destructive" onClick={() => handleDeleteClick(s)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                  <Button size="icon" variant="secondary" onClick={() => setSelectedService(s)}>
                    <Eye className="w-4 h-4" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <SalonServiceDetailsModal
        open={!!selectedService}
        onClose={() => setSelectedService(null)}
        service={selectedService}
      />
      <DeleteServiceModal
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        serviceToDelete={serviceToDelete}
        onConfirm={handleConfirmDelete}
        loading={loading}
      />
    </div>
  )
}
