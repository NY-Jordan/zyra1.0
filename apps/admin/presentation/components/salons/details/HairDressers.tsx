'use client'
import { useState } from 'react'
import { Button } from '@zyra/ui/components/button'
import { HairDresserSalonAssociation, IHairDresser } from '@zyra/conf/domain/entities/hairdressers.entities'
import { Trash2, Ban, Eye } from 'lucide-react'
import ConfirmModal from '@/presentation/components/CofirmModal'
import { useHairDressers } from '@/usecases/useHairDressers'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import ViewHairDresserModal from '@/presentation/components/hairdressers/ViewHairDresserModal'

export default function HairDressers({
  hairdressers, salonId, salonName,
}: {
  hairdressers: IHairDresser[]
  salonId: string
  salonName?: string
}) {
  const [dissociateModalOpen, setDissociateModalOpen] = useState(false)
  const [statusModalOpen, setStatusModalOpen] = useState(false)
  const [viewModalOpen, setViewModalOpen] = useState(false)
  const [selected, setSelected] = useState<IHairDresser | null>(null)
  const [selectedAssociation, setSelectedAssociation] = useState<HairDresserSalonAssociation | null>(null)
  const { dissociateHairDresserFromSalon, dissociatePending, toggleAssociationStatus, toggleAssociationPending } = useHairDressers()
  const queryClient = useQueryClient()

  const handleView = (h: IHairDresser, assoc: HairDresserSalonAssociation | null) => {
    setSelected(h)
    setSelectedAssociation(assoc)
    setViewModalOpen(true)
  }
  const handleDissociate = (h: IHairDresser) => { setSelected(h); setDissociateModalOpen(true) }
  const handleToggleStatus = (h: IHairDresser, assoc: HairDresserSalonAssociation) => {
    setSelected(h); setSelectedAssociation(assoc); setStatusModalOpen(true)
  }

  const handleConfirmDissociate = async () => {
    if (!selected) return
    await dissociateHairDresserFromSalon({ hairDresserId: selected.id, salonId })
    setDissociateModalOpen(false); setSelected(null)
    queryClient.invalidateQueries({ queryKey: ['hairdressers-by-salon'] })
    toast.success("Coiffeur dissocié du salon avec succès")
  }
  const handleConfirmStatus = async () => {
    if (!selected) return
    await toggleAssociationStatus({ hairDresserId: selected.id, salonId })
    setStatusModalOpen(false); setSelected(null)
    queryClient.invalidateQueries({ queryKey: ['hairdressers-by-salon'] })
    toast.success(selectedAssociation?.active ? "Coiffeur désactivé" : "Coiffeur activé")
  }

  const th = "px-4 py-3 text-left text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide whitespace-nowrap"
  const td = "px-4 py-3 text-[13px] text-slate-700 dark:text-slate-300"

  return (
    <div>
      {hairdressers.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-slate-400 dark:text-slate-500">
          <p className="text-[14px] font-medium">Aucun coiffeur associé à ce salon</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-[#F0EAE4] dark:border-slate-800/50">
          <table className="min-w-full">
            <thead className="bg-[#FAF7F4] dark:bg-slate-800/50">
              <tr>
                <th className={th}>Coiffeur</th>
                <th className={th}>Spécialité</th>
                <th className={th}>Contact</th>
                <th className={`${th} text-center`}>Prises</th>
                <th className={`${th} text-center`}>Confirmées</th>
                <th className={`${th} text-center`}>Réalisées</th>
                <th className={th}>Statut</th>
                <th className={th}>Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0EAE4] dark:divide-slate-800/50">
              {hairdressers.map(h => {
                const assoc: HairDresserSalonAssociation | null = (h as any).salonIds?.find((s: any) => s.salonId === salonId) ?? null
                return (
                  <tr key={h.id} className="hover:bg-[#FAF7F4] dark:hover:bg-slate-800/20 transition-colors">
                    <td className={td}>
                      <div className="flex items-center gap-3">
                        {h.photo ? (
                          <img src={h.photo} alt={h.name} className="w-9 h-9 rounded-xl object-cover border border-[#F0EAE4] dark:border-slate-700 flex-shrink-0" />
                        ) : (
                          <div className="w-9 h-9 rounded-xl bg-emerald-500 flex items-center justify-center text-white font-bold text-[13px] flex-shrink-0">
                            {h.name?.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <p className="font-semibold text-[13px] text-slate-800 dark:text-white">{h.name}</p>
                          <p className="text-[11px] text-slate-400">
                            {h.createdAt ? new Date(h.createdAt).toLocaleDateString('fr-FR') : '—'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className={td}>{h.speciality || '—'}</td>
                    <td className={td}>
                      <div>
                        <p className="text-[12px]">{h.email || '—'}</p>
                        <p className="text-[11px] text-slate-400">{h.phone || ''}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="text-[14px] font-bold text-sky-600 dark:text-sky-400">{h.reservationsTaken ?? 0}</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="text-[14px] font-bold text-emerald-600 dark:text-emerald-400">{h.reservationsConfirmed ?? 0}</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="text-[14px] font-bold text-violet-600 dark:text-violet-400">{h.reservationsDone ?? 0}</span>
                    </td>
                    <td className={td}>
                      {assoc ? (
                        <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          assoc.active
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800/40'
                            : 'bg-slate-100 text-slate-500 border-slate-200 dark:bg-slate-800 dark:border-slate-700'
                        }`}>
                          <span className="w-1.5 h-1.5 rounded-full bg-current" />
                          {assoc.active ? 'Actif' : 'Inactif'}
                        </span>
                      ) : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <Button size="icon" variant="ghost"
                          className="w-7 h-7 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
                          title="Voir les détails"
                          onClick={() => handleView(h, assoc)}
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </Button>
                        <Button size="icon" variant="ghost"
                          className={`w-7 h-7 ${assoc?.active ? 'text-slate-400 hover:text-amber-600 hover:bg-amber-50' : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50'}`}
                          title={assoc?.active ? 'Désactiver' : 'Activer'}
                          onClick={() => assoc && handleToggleStatus(h, assoc)}
                        >
                          <Ban className="w-3.5 h-3.5" />
                        </Button>
                        <Button size="icon" variant="ghost"
                          className="w-7 h-7 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                          title="Dissocier du salon"
                          onClick={() => handleDissociate(h)}
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

      <ViewHairDresserModal
        open={viewModalOpen}
        onClose={() => { setViewModalOpen(false); setSelected(null); setSelectedAssociation(null) }}
        hairDresser={selected}
        salonName={salonName}
        association={selectedAssociation}
      />
      <ConfirmModal
        open={dissociateModalOpen}
        title="Dissocier le coiffeur"
        description={`Voulez-vous vraiment dissocier ${selected?.name} de ce salon ?`}
        onCancel={() => { setDissociateModalOpen(false); setSelected(null) }}
        onConfirm={handleConfirmDissociate}
        confirmLabel="Dissocier"
        loading={dissociatePending}
        confirmVariant="destructive"
      />
      <ConfirmModal
        open={statusModalOpen}
        title={selectedAssociation?.active ? "Désactiver le coiffeur" : "Activer le coiffeur"}
        description={selectedAssociation?.active ? `Désactiver ${selected?.name} ?` : `Activer ${selected?.name} ?`}
        onCancel={() => { setStatusModalOpen(false); setSelected(null); setSelectedAssociation(null) }}
        onConfirm={handleConfirmStatus}
        confirmLabel={selectedAssociation?.active ? "Désactiver" : "Activer"}
        loading={toggleAssociationPending}
        confirmVariant={selectedAssociation?.active ? "destructive" : "default"}
      />
    </div>
  )
}
