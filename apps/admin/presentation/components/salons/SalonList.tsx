'use client'
import { Button } from "@zyra/ui/components/button"
import { Badge } from "@zyra/ui/components/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@zyra/ui/components/table"
import { useRouter } from "next/navigation"
import { ISalon } from "@zyra/conf/domain/entities/salons.entities"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { deleteDocument, editDocument, fetchCollection } from "@zyra/conf/lib/query"
import { useMemo, useState } from "react"
import { documentId, where } from "firebase/firestore"
import { SalonStatusEnum } from "@zyra/conf/domain/enums/statusEnum"
import { SuspendSalonModal } from "./SuspendSalonModal"
import { toast } from "sonner"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@zyra/ui/components/dialog"
import DeleteSalonModal from "./DeleteSalonModal"

export default function SalonList({ salons }: { salons: ISalon[] }) {
  const router = useRouter()
  const ownerIds = useMemo(() => {
    return Array.from(new Set(salons.map(s => s.ownerId).filter(Boolean)))
  }, [salons]);

  const { data: owners = [] } = useQuery({
    queryKey: ['owners', ownerIds],
    queryFn: async () => {
      if (ownerIds.length === 0) return []
      return await fetchCollection("owners", [
        where(documentId(), "in", ownerIds)
      ])
    },
    enabled: ownerIds.length > 0,
  })

  // Map for quick access to owner names
  const ownerMap = useMemo(() => {
    const map: Record<string, string> = {}
    owners.forEach((o: any) => {
      map[o.id] = o.name
    })
    return map
  }, [owners])
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedSalon, setSelectedSalon] = useState<ISalon | null>(null)

  const handleSuspendClick = (salon: ISalon) => {
    setSelectedSalon(salon)
    setModalOpen(true)
  }

  // Pour la suppression
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [salonToDelete, setSalonToDelete] = useState<ISalon | null>(null)

  const handleDeleteClick = (salon: ISalon) => {
    setSalonToDelete(salon)
    setDeleteModalOpen(true)
  }

  // Fetch salon categories
  const { data: categories = [], isLoading: loadingCategories } = useQuery({
    queryKey: ['salon-categories'],
    queryFn: async () => {
      const res = await fetchCollection('salon_categories')
      return res.map((cat: any) => ({
        id: cat.id,
        name: cat.name,
        active: cat.active ?? true,
      }))
    },
  })

  // Fetch countries
  const { data: countries = [], isLoading: loadingCountries } = useQuery({
    queryKey: ['countries'],
    queryFn: async () => {
      const res = await fetchCollection('countries')
      return res.map((c: any) => ({
        id: c.id,
        name: c.name,
        active: c.active ?? true,
      }))
    },
  })

  // Map for quick access to category names
  const categoryMap = useMemo(() => {
    const map: Record<string, string> = {}
    categories.forEach((c: any) => {
      map[c.id] = c.name
    })
    return map
  }, [categories])

  // Map for quick access to country names
  const countryMap = useMemo(() => {
    const map: Record<string, string> = {}
    countries.forEach((c: any) => {
      map[c.id] = c.name
    })
    return map
  }, [countries])

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Logo</TableHead>
            <TableHead>Nom</TableHead>
            <TableHead>Ville</TableHead>
            <TableHead>Catégorie</TableHead>
            <TableHead>Pays</TableHead>
            <TableHead>Propriétaire</TableHead>
            <TableHead>Statut</TableHead>
            <TableHead>Réservations</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {salons.map((salon, key) => (
            <TableRow key={key}>
              <TableCell>
                {salon.photos?.length ? (
                  <img
                    src={salon.photos[0]}
                    alt={salon.name}
                    className="w-9 h-9 rounded-full object-cover border bg-gray-100"
                  />
                ) : null}
              </TableCell>
              <TableCell>{salon.name}</TableCell>
              <TableCell>{salon.city}</TableCell>
              <TableCell>
                {categoryMap[salon.category] || <span className="text-gray-400 italic">Non Catégorisé</span>}
              </TableCell>
              <TableCell>
                {countryMap[salon.country] || <span className="text-gray-400 italic">Pays non Identifié</span>}
              </TableCell>
              <TableCell>
                {ownerMap[salon.ownerId] || <span className="text-gray-400 italic">-</span>}
              </TableCell>
              <TableCell>
                <Badge variant={salon.status.name === SalonStatusEnum.active ? "outline" : salon.status.name === SalonStatusEnum.suspended ? "secondary" : "destructive"}>
                  {salon.status.name}
                </Badge>
              </TableCell>
              <TableCell>
                <span className="font-bold text-blue-600">{salon.reservationsCount}</span>
              </TableCell>
              <TableCell className="text-right space-x-2">
                <Button onClick={() => router.push(`/admin/salons/details/${salon.id}`)} variant="outline" size="sm">Voir</Button>
                <Button
                  variant={salon.status.name === SalonStatusEnum.suspended ? "default" : "secondary"}
                  className="hover:cursor-pointer"
                  size="sm"
                  onClick={() => handleSuspendClick(salon)}
                >
                  {salon.status.name === SalonStatusEnum.suspended ? "Réactiver" : "Suspendre"}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push(`/admin/salons/update/${salon.id}`)}
                >
                  Editer
                </Button>
                <Button
                  variant="destructive"
                  className="hover:cursor-pointer"
                  size="sm"
                  onClick={() => handleDeleteClick(salon)}
                >
                  Supprimer
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {/* Suspend Modal */}
      {selectedSalon && <SuspendSalonModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          salonName={selectedSalon?.name || ""}
          onConfirm={() => {
            queryClient.invalidateQueries({ queryKey: ['salons'] })
            setModalOpen(false)
            setSelectedSalon(null);
          }}
          isSuspended={selectedSalon?.status.name === SalonStatusEnum.suspended}
          selectedSalon={selectedSalon}
        />}

      {/* Deletion Modal */}
      {
        salonToDelete && <DeleteSalonModal
          open={deleteModalOpen}
          onClose={() => setDeleteModalOpen(false)}
          salonToDelete={salonToDelete}
          onConfirm={() => {
            queryClient.invalidateQueries({ queryKey: ['salons'] })
            setDeleteModalOpen(false)
            setSalonToDelete(null);
          }}
        />
      }

    </>
  )
}
