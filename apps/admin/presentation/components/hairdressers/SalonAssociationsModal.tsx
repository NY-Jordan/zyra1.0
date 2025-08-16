'use client'
import { useEffect, useMemo, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@zyra/ui/components/dialog"
import { Input } from "@zyra/ui/components/input"
import { Button } from "@zyra/ui/components/button"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { fetchCollection, editDocument } from "@zyra/conf/lib/query"
import { where } from "firebase/firestore"
import { HairDresserSalonAssociation, IHairDresser } from "@zyra/conf/domain/entities/hairdressers.entities"
import { ISalon } from "@zyra/conf/domain/entities/salons.entities"

export default function SalonAssociationsModal({
  open,
  onClose,
  hairDresser,
  salons,
  onUpdate,
}: {
  open: boolean
  onClose: () => void
  hairDresser: IHairDresser | null
  salons: any[]
  onUpdate?: (newSalonIds: HairDresserSalonAssociation[]) => void
}) {
  const [search, setSearch] = useState("")
  const [selectedSalons, setSelectedSalons] = useState<ISalon[]>([])
  const [loading, setLoading] = useState(false)
  const queryClient = useQueryClient()

  const { data: associatedSalons = [] } = useQuery({
    queryKey: ['salons-associated', hairDresser?.salonIds],
    enabled: open && !!hairDresser && Array.isArray(hairDresser.salonIds) && hairDresser.salonIds.length > 0,
    queryFn: async () => {
      return await fetchCollection('salons', [
        where("id", "in", hairDresser!.salonIds?.map(s => s.salonId) || []) 
      ])
    }
  })

  const { data: filteredSalons = [], isFetching: searching } = useQuery({
    queryKey: ['salons-search', search],
    enabled: !!search,
    queryFn: async () => {
      if (!search) return []
      return await fetchCollection('salons', [
        where("name", ">=", search),
        where("name", "<", search + "\uf8ff")
      ])
    }
  })


  // Init selected salons quand modal ouvert
  useMemo(() => {
  if (associatedSalons.length) {
    setSelectedSalons(associatedSalons as ISalon[])
  }
}, [associatedSalons])

  // Add salon to association
  const handleAddSalon = (salon: ISalon) => {
    if (!selectedSalons.find((s) => s.id === salon.id)) {
      setSelectedSalons([...selectedSalons, salon])
    }
  }

  // Remove salon from association
  const handleRemoveSalon = (salonId: string) => {
    setSelectedSalons(selectedSalons.filter((s) => s.id !== salonId))
  }

  // Save associations
  const handleSave = async () => {
    if (!hairDresser) return
    setLoading(true)
    const salonIds : HairDresserSalonAssociation[] = selectedSalons.map((s) => ({
      salonId: s.id,
      active: true,
    }))
    await editDocument("hair_dressers", hairDresser.id, {
      salonIds,
    })
    setLoading(false)
    queryClient.invalidateQueries({ queryKey: ['hair-dressers'] })
    if (onUpdate) onUpdate(salonIds)
    onClose()
  }

  

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Salons associés à {hairDresser?.name}</DialogTitle>
        </DialogHeader>
        <div className="mb-4">
          <Input
            placeholder="Rechercher un salon par nom ou ville..."
            value={search}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap gap-4 mb-6">
          {selectedSalons.map((salon: ISalon) => (
            <div key={salon.id} className="bg-gray-50 rounded-lg shadow p-4 min-w-[200px] flex flex-col gap-2 relative border">
              <div className="font-bold text-lg">{salon.name}</div>
              <div className="text-gray-500">{salon.city}</div>
              <div>
                <span className={`px-2 py-1 rounded text-xs ${salon.status.name === "active" ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-600"}`}>
                  {salon.status.name}
                </span>
              </div>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => handleRemoveSalon(salon.id)}
              >
                Retirer
              </Button>
            </div>
          ))}
          {selectedSalons.length === 0 && (
            <div className="text-gray-400 italic">Aucun salon associé</div>
          )}
        </div>
        {search && (
          <div>
            <div className="mb-2 font-semibold text-sm">Résultats de recherche :</div>
            <div className="flex flex-wrap gap-4">
              {searching ? (
                <div className="text-gray-400 italic">Recherche...</div>
              ) : (
                filteredSalons
                  .filter(s => !selectedSalons.find((sel) => sel.id === s.id))
                  .map((salon, idx) => {
                    const typedSalon = salon as ISalon
                    return (
                    <div key={typedSalon.id} className="bg-white border rounded-lg shadow p-4 min-w-[200px] flex flex-col gap-2">
                      <div className="font-bold">{typedSalon.name}</div>
                      <div className="text-gray-500">{typedSalon.city}</div>
                      <div>
                        <span className={`px-2 py-1 rounded text-xs ${typedSalon.status.name === "active" ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-600"}`}>
                          {typedSalon.status.name}
                        </span>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleAddSalon(typedSalon)}
                      >
                        Associer
                      </Button>
                    </div>
                  )
                  })
              )}
              {!searching && filteredSalons.filter((s: any) => !selectedSalons.find((sel) => sel.id === s.id)).length === 0 && (
                <div className="text-gray-400 italic">Aucun salon trouvé</div>
              )}
            </div>
          </div>
        )}
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline">Fermer</Button>
          </DialogClose>
          <Button type="button" onClick={handleSave} disabled={loading}>
            {loading ? "Enregistrement..." : "Enregistrer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}