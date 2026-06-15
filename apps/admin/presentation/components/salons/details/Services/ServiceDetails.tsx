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

  const th = "px-4 py-3 text-left text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide whitespace-nowrap"
  const td = "px-4 py-3 text-[13px] text-slate-700 dark:text-slate-300"

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-[12px] text-slate-400">{services?.length ?? 0} service{(services?.length ?? 0) > 1 ? 's' : ''}</p>
        <Button size="sm" onClick={() => setShowForm(v => !v)}
          className="h-8 text-[12px] bg-[#0b0b14] dark:bg-emerald-600 text-white hover:opacity-90">
          <Plus className="w-3.5 h-3.5 mr-1.5" /> Ajouter
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
      {(services || []).length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-slate-400 dark:text-slate-500">
          <p className="text-[14px] font-medium">Aucun service enregistré</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-[#F0EAE4] dark:border-slate-800/50">
          <table className="min-w-full">
            <thead className="bg-[#FAF7F4] dark:bg-slate-800/50">
              <tr>
                <th className={th}>Service</th>
                <th className={th}>Catégorie</th>
                <th className={th}>Prix</th>
                <th className={th}>Durée</th>
                <th className={th}>Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0EAE4] dark:divide-slate-800/50">
              {(services || []).map((s: ISalonService, i: number) => {
                const cat = salon.serviceCategories?.find((c: any) => c.id === s.categoryId)
                return (
                  <tr key={i} className="hover:bg-[#FAF7F4] dark:hover:bg-slate-800/20 transition-colors">
                    <td className={td}>
                      <div className="flex items-center gap-3">
                        {s.imageUrl ? (
                          <img src={s.imageUrl} alt="" className="w-9 h-9 rounded-xl object-cover border border-[#F0EAE4] dark:border-slate-700 flex-shrink-0" />
                        ) : (
                          <div className="w-9 h-9 rounded-xl bg-[#FEF1EC] dark:bg-rose-950/30 flex items-center justify-center flex-shrink-0">
                            <span className="text-rose-400 font-bold text-[11px]">{s.name?.charAt(0)}</span>
                          </div>
                        )}
                        <span className="font-semibold text-[13px] text-slate-800 dark:text-white">{s.name}</span>
                      </div>
                    </td>
                    <td className={td}>
                      {cat ? (
                        <span className="text-[11px] font-semibold text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-950/30 px-2 py-0.5 rounded-full">
                          {cat.name}
                        </span>
                      ) : '—'}
                    </td>
                    <td className={td}>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">
                        {Number(s.price).toLocaleString('fr-FR')} FCFA
                      </span>
                    </td>
                    <td className={td}>{s.duration} min</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <Button size="icon" variant="ghost"
                          className="w-7 h-7 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
                          title="Voir les détails"
                          onClick={() => setSelectedService(s)}
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </Button>
                        <Button size="icon" variant="ghost"
                          className="w-7 h-7 text-slate-400 hover:text-sky-600 hover:bg-sky-50 dark:hover:bg-sky-950/30"
                          title="Modifier"
                          onClick={() => handleEditClick(s)}
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                        <Button size="icon" variant="ghost"
                          className="w-7 h-7 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                          title="Supprimer"
                          onClick={() => handleDeleteClick(s)}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
      <SalonServiceDetailsModal
        open={!!selectedService}
        onClose={() => setSelectedService(null)}
        service={selectedService}
        categoryLabel={selectedService ? salon.serviceCategories?.find((c: any) => c.id === selectedService.categoryId)?.name : undefined}
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
