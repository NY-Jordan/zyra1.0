'use client'
import React, { useState } from 'react'
import { Button } from '@zyra/ui/components/button'
import ProtectedLayout from '@/presentation/layouts/ProtectedLayout'
import HairDressersList from '@/presentation/components/hairdressers/HairDressersList'
import CreateHairDresserModal from '@/presentation/components/hairdressers/CreateHairDresserModal'
import { useQuery } from '@tanstack/react-query'
import { fetchCollectionPaginate, fetchCollection } from '@zyra/conf/lib/query'
import Pagination from '@/presentation/components/common/Pagination'
import { Input } from '@zyra/ui/components/input'
import { where, orderBy } from "firebase/firestore"

const PAGE_SIZE = 25

type HairDressersQueryResult = {
  data: any[],
  total: number
}

const statuts = [
  { label: "Tous les statuts", value: "Tous les statuts" },
  { label: "Actif", value: "active" },
  { label: "Suspendu", value: "suspended" },
]

export default function HairDressersListPage() {
  const [modalOpen, setModalOpen] = useState(false)
  const [page, setPage] = useState(1)
  const [keyword, setKeyword] = useState("")
  const [country, setCountry] = useState("Tous les pays")
  const [statut, setStatut] = useState("Tous les statuts")
  const [minSalons, setMinSalons] = useState("")

  // Fetch countries for filter
  const { data: countries = [] } = useQuery({
    queryKey: ['countries'],
    queryFn: async () => {
      const res = await fetchCollection('countries')
      return res.filter((c: any) => c.active !== false)
    },
  })

  const { data, refetch, isLoading } = useQuery<HairDressersQueryResult>({
    queryKey: ['hair-dressers', page, keyword, country, statut, minSalons],
    queryFn: async () => {
      const constraints: any[] = []
      // Filter by country if selected
      if (country && country !== "Tous les pays") {
        constraints.push(where("country", "==", country))
      }
      // Filter by status if selected
      if (statut && statut !== "Tous les statuts") {
        constraints.push(where("status", "==", statut))
      }
      constraints.push(orderBy("name"))

      // Paginated fetch with constraints
      const res = await fetchCollectionPaginate('hair_dressers', {
        pageSize: PAGE_SIZE,
        page: page,
        constraints: constraints
      })
      let hairDressers = res.data as any[]

      // Filter by keyword (client-side)
      if (keyword) {
        hairDressers = hairDressers.filter((hd: any) =>
          hd.name?.toLowerCase().includes(keyword.toLowerCase()) ||
          hd.speciality?.toLowerCase().includes(keyword.toLowerCase()) ||
          hd.email?.toLowerCase().includes(keyword.toLowerCase())
        )
      }
      if (minSalons) {
        hairDressers = hairDressers.filter((hd: any) =>
          Array.isArray(hd.salonIds) && hd.salonIds.length >= Number(minSalons)
        )
      }

      return {
        data: hairDressers,
        total: res.total
      }
    },
  })

  const hairDressers = data?.data || []
  const total = data?.total || 0

  return (
    <ProtectedLayout pageTitle="Coiffeurs" breadcrumbs={[
      { label: "Dashboard", href: "/" },
      { label: "Coiffeurs", isCurrent: true }
    ]}>
      <div className="mx-auto py-8">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div className='flex flex-row gap-2 items-center'>
            {/* Search by keyword */}
            <Input
              placeholder="Rechercher un coiffeur..."
              className="w-[220px]"
              value={keyword}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setKeyword(e.target.value)}
            />
            {/* Filter by country */}
            <select
              className="border rounded px-2 py-2 text-sm"
              value={country}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setCountry(e.target.value)}
            >
              <option value="Tous les pays">Tous les pays</option>
              {countries.map((c: any) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            {/* Filter by status */}
            <select
              className="border rounded px-2 py-2 text-sm"
              value={statut}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setStatut(e.target.value)}
            >
              {statuts.map(s => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
            <Input
              type="number"
              min={0}
              placeholder="Min. salons associés"
              className="w-[150px]"
              value={minSalons}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMinSalons(e.target.value)}
            />
          </div>
          <Button onClick={() => setModalOpen(true)}>Ajouter un coiffeur</Button>
        </div>
        <HairDressersList hairDressers={hairDressers}  />
        <Pagination
          page={page}
          pageSize={PAGE_SIZE}
          total={total}
          onPageChange={setPage}
        />
        <CreateHairDresserModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
        />
      </div>
    </ProtectedLayout>
  )
}