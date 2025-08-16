'use client'
import { Button } from '@zyra/ui/components/button'
import { Input } from '@zyra/ui/components/input'
import SalonList from '@/presentation/components/salons/SalonList'
import ProtectedLayout from '@/presentation/layouts/ProtectedLayout'
import React, { useState } from 'react'
import { Plus } from "lucide-react"
import { Routes } from '@zyra/conf/lib/route'
import { useQuery } from '@tanstack/react-query'
import { fetchCollectionPaginate, fetchCollection } from '@zyra/conf/lib/query'
import { where, orderBy } from "firebase/firestore"
import { ISalon } from '@zyra/conf/domain/entities/salons.entities'
import { useRouter } from 'next/navigation'

const statuts = [
  { label: "Tous les statuts", value: "Tous les statuts" },
  { label: "validé", value: "active" },
  { label: "suspendu", value: "suspended" },
]



export default function Index() {
  const [keyword, setKeyword] = useState("")
  const [country, setCountry] = useState("Tous les pays")
  const [category, setCategory] = useState("Toutes les catégories")
  const [statut, setStatut] = useState("Tous les statuts")
  const [minReservations, setMinReservations] = useState("")
  const router = useRouter();

  const { data: countries = [] } = useQuery({
    queryKey: ['countries'],
    queryFn: async () => {
      const res = await fetchCollection('countries')
      return res.filter((c: any) => c.active !== false)
    },
  })

  const { data: categories = [] } = useQuery({
    queryKey: ['salon-categories'],
    queryFn: async () => {
      const res = await fetchCollection('salon_categories')
      return res.filter((cat: any) => cat.active !== false)
    },
  })

  const { data = { salons: [], total: 0 }, isLoading } = useQuery({
    queryKey: ['salons', { keyword, country, statut, minReservations, category }],
    queryFn: () => fetchSalons({ keyword, country, statut, minReservations, category }),
    refetchOnWindowFocus: true,
  })

  return (
    <ProtectedLayout pageTitle='Liste des salons' breadcrumbs={[
      { label: "Dashboard", href: "/" },
      { label: "Salons", isCurrent: true }
    ]}>

      <div className="flex flex-wrap justify-between items-center gap-3 mb-6">
        <div className='flex flex-row gap-2 items-center'>
          {/* Search by salon name */}
          <Input
            placeholder="Rechercher un salon..."
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
          {/* Filter by category */}
          <select
            className="border rounded px-2 py-2 text-sm"
            value={category}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setCategory(e.target.value)}
          >
            <option value="Toutes les catégories">Toutes les catégories</option>
            {categories.map((cat: any) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
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
          {/* Filter by minimum reservations */}
          <Input
            type="number"
            min={0}
            placeholder="Min. réservations"
            className="w-[150px]"
            value={minReservations}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMinReservations(e.target.value)}
          />
        </div>
        <Button onClick={() => router.push(Routes.protected.salons.create.url)} className=' hover:cursor-pointer' variant="default">
          <Plus className="w-4 h-4 mr-2" />
          Ajouter un salon
        </Button>
      </div>
      <SalonList salons={data.salons} />
    </ProtectedLayout>
  )
}


async function fetchSalons({ keyword, country, statut, minReservations, category }: {
  keyword: string,
  country: string,
  statut: string,
  minReservations: string,
  category: string
}) {
  const constraints: any[] = []
  // Filter by country if selected
  if (country && country !== "Tous les pays") {
    constraints.push(where("country", "==", country))
  }
  // Filter by category if selected
  if (category && category !== "Toutes les catégories") {
    constraints.push(where("category", "==", category))
  }
  // Filter by status if selected
  if (statut && statut !== "Tous les statuts") {
    constraints.push(where("status.name", "==", statut))
  }
  // Filter by minimum reservations if set
  if (minReservations) {
    constraints.push(where("reservationsCount", ">=", Number(minReservations)))
  }
  constraints.push(orderBy("name"))

  // Paginated fetch with constraints
  const salonsPaginated = await fetchCollectionPaginate("salons", {
    constraints: constraints
  });
  let salons = salonsPaginated.data as ISalon[];
  // Filter by keyword (client-side)
  if (keyword) {
    salons = salons.filter((salon: any) =>
      salon.name?.toLowerCase().includes(keyword.toLowerCase())
    )
  }

  return { salons, total: salonsPaginated.total }
}