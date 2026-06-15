'use client'
import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { fetchCollectionPaginate, fetchCollection } from '@zyra/conf/lib/query'
import { IReservation } from '@zyra/conf/domain/entities/reservations.entities'
import ReservationsList from '@/presentation/components/reservations/ReservationsList'
import { Input } from '@zyra/ui/components/input'
import { where } from 'firebase/firestore'
import { Calendar22 } from '@/presentation/components/Calendar22'
import PageHeader from '@/presentation/components/common/PageHeader'

const PAGE_SIZE = 20

const statusOptions = [
  { label: "Tous les statuts", value: "" },
  { label: "En attente", value: "pending" },
  { label: "Confirmée", value: "confirmed" },
  { label: "Terminée", value: "completed" },
  { label: "Annulée", value: "cancelled" },
]

export default function ReservationsIndex() {
  const [page, setPage] = useState(1)
  const [searchSalon, setSearchSalon] = useState("")
  const [filterStatus, setFilterStatus] = useState("")
  const [filterCountry, setFilterCountry] = useState("")
  const [filterDate, setFilterDate] = useState<Date | null>(null)

  // Fetch salons for reconciliation
  const { data: salons = [] } = useQuery({
    queryKey: ['salons-all'],
    queryFn: async () => await fetchCollection('salons'),
    refetchOnWindowFocus: false,
  })

  // Fetch countries
/*   const { data: countries = [] } = useCountries()
 */
  // Fetch paginated reservations with filters
  const { data = { data: [], total: 0 }, isLoading } = useQuery({
    queryKey: ['reservations', page, searchSalon, filterStatus, filterCountry, filterDate],
    queryFn: async () => {
      const constraints: any[] = []
      if (filterStatus) constraints.push(where("status", "==", filterStatus))
      if (filterCountry) constraints.push(where("country", "==", filterCountry))
      if (filterDate) {
        // Filtre par date (ignorer l'heure)
        const start = new Date(filterDate)
        start.setHours(0, 0, 0, 0)
        const end = new Date(filterDate)
        end.setHours(23, 59, 59, 999)
        constraints.push(where("scheduledAt", ">=", start))
        constraints.push(where("scheduledAt", "<=", end))
      }
      const reservationsPaginated = await fetchCollectionPaginate('reservations', {
        page,
        pageSize: PAGE_SIZE,
        constraints,
      })
      let reservations = reservationsPaginated.data as IReservation[]
      // Filtre par nom du salon (client-side)
      if (searchSalon) {
        reservations = reservations.filter((r: any) => {
          const salon = salons.find((s: any) => s.id === r.salonId)
          return salon?.name?.toLowerCase().includes(searchSalon.toLowerCase())
        })
      }
      // Trie par date (sans l'heure)
      reservations = reservations.sort((a: any, b: any) => {
        const dateA = a.scheduledAt?.toDate?.()
        const dateB = b.scheduledAt?.toDate?.()
        if (!dateA || !dateB) return 0
        return dateA.setHours(0,0,0,0) - dateB.setHours(0,0,0,0)
      })
      return { data: reservations, total: reservationsPaginated.total }
    },
    refetchOnWindowFocus: true,
  })

  return (
    <>
      <PageHeader 
        title="Liste des réservations"
        breadcrumbs={[
          { label: "Dashboard", href: "/admin" },
          { label: "Réservations", isCurrent: true }
        ]}
      />

      <div className="space-y-6">
        {/* Filters */}
        <div className="flex flex-wrap gap-3 items-center">
          <Input
            placeholder="Rechercher par salon..."
            className="w-[220px]"
            value={searchSalon}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchSalon(e.target.value)}
          />
          <select
            className="border rounded px-2 py-2 text-sm"
            value={filterStatus}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFilterStatus(e.target.value)}
          >
            {statusOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <Calendar22
            selected={filterDate}
            onChange={date => setFilterDate(date)}
            dateFormat="dd MMMM yyyy"
            placeholderText="Filtrer par date"
            className="border rounded px-2 py-2 text-sm"
          />
        </div>

        {/* Reservations List */}
        <div className="bg-white rounded shadow p-4">
          <ReservationsList
            reservations={data.data as IReservation[]}
            salons={salons}
            loading={isLoading}
            page={page}
            pageSize={PAGE_SIZE}
            total={data.total}
            onPageChange={setPage}
          />
        </div>
      </div>
    </>
  )
}
