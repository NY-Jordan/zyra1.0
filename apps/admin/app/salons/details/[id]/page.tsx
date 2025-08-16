'use client'
import { useRouter, useSearchParams } from "next/navigation"
import  { useState } from "react"
import * as React from "react";
import { useQuery } from "@tanstack/react-query"
import { Button } from "@zyra/ui/components/button"
import { Badge } from "@zyra/ui/components/badge"
import { Card } from "@zyra/ui/components/card"
import { Users, Scissors, Calendar, Trash2, Ban } from "lucide-react"
import ProtectedLayout from "@/presentation/layouts/ProtectedLayout"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@zyra/ui/components/tabs"
import { fetchCollection, fetchCollectionPaginate } from "@zyra/conf/lib/query"
import { where } from "firebase/firestore"
import { toast } from "sonner"
import ReservationsDetails from "@/presentation/components/salons/details/ReservationsDetails"
import TimeSlotsDetails from "@/presentation/components/salons/details/TimeSlots/TimeSlotsDetails"
import ServiceDetails from "@/presentation/components/salons/details/Services/ServiceDetails"
import HairDressers from "@/presentation/components/salons/details/HairDressers"
import Pagination from "@/presentation/components/common/Pagination"
import { ISalon, ISalonService } from "@zyra/conf/domain/entities/salons.entities"
import { IOwner } from "@zyra/conf/domain/entities/owners.entities"
import { SalonStatusEnum } from "@zyra/conf/domain/enums/statusEnum"
import { IHairDresser } from "@zyra/conf/domain/entities/hairdressers.entities"
import ServiceCategoriesDetails from "@/presentation/components/salons/details/ServiceCategoriesDetails"

const PAGE_SIZE = 5

export default function SalonDetails({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { id } = React.use(params);
  const [owner, setOwner] = useState<IOwner | null>(null)
  const [page, setPage] = useState(1)

  // Fetch salon
  const {
    data: salon,
    isLoading,
  } = useQuery({
    queryKey: ['fetch-salon-details', id],
    enabled: !!id,
    queryFn: async () => {
      const salons = await fetchCollection("salons", [where("id", "==", id as string)]) as ISalon[]
      if (!salons.length) {
        toast.error("Salon introuvable")
        router.replace("/salons")
        return null
      }
      const salonData = salons[0]
      if (salonData?.ownerId) {
        const owners = await fetchCollection("owners", [where("id", "==", salonData.ownerId)]) as IOwner[]
        setOwner(owners[0] || null)
      } else {
        setOwner(null)
      }
      return salonData
    }
  })

  // Fetch paginated hairdressers for this salon
 const { data: hairdressersData = { data: [], total: 0 }, isLoading: loadingHairdressers } = useQuery({
  queryKey: ['hairdressers-by-salon', id, page],
  enabled: !!id,
  queryFn: async () => {
    const active = await fetchCollectionPaginate("hair_dressers", {
      page,
      pageSize: PAGE_SIZE,
      constraints: [where("salonIds", "array-contains", { salonId: id as string, active: true })],
    })
    const inactive = await fetchCollectionPaginate("hair_dressers", {
      page,
      pageSize: PAGE_SIZE,
      constraints: [where("salonIds", "array-contains", { salonId: id as string, active: false })],
    })
    return {
      data: [...(active.data || []), ...(inactive.data || [])],
      total: (active.total || 0) + (inactive.total || 0)
    }
  }
})

  const hairdressers = hairdressersData.data || [] 
  const totalHairdressers = hairdressersData.total || 0

  // Fetch salon category label from DB
  const { data: categories = [] } = useQuery({
    queryKey: ['salon-categories'],
    queryFn: async () => {
      return await fetchCollection('salon_categories')
    },
  })


  const categoryLabel = categories.find((cat: any) => cat.id === salon?.category)?.name || salon?.category

  if (isLoading || !salon) {
    return (
      <ProtectedLayout pageTitle="Détails du salon">
        <div className="p-8 text-center">Chargement...</div>
      </ProtectedLayout>
    )
  }

  const salonLogo = salon?.photos?.[0] || "https://media.istockphoto.com/id/1405447809/fr/vectoriel/ciseaux-et-peigne-avec-motif-et-cadre-design-pour-coiffeur-et-salon-de-beaut%C3%A9.jpg?s=612x612&w=0&k=20&c=e_I7ZqWyNOa848dmxk7LMNgaDtq_GRqEz3nuy2-cwnc="
  const reservationsList: any[] = []
  const timesSlots = salon?.openingHours || []
  const services: ISalonService[] = salon?.services || []

  return (
    <ProtectedLayout pageTitle="Détails du salon" breadcrumbs={[
      { label: "Dashboard", href: "/" },
      { label: "Salons", href: "/salons" },
      { label: salon?.name, isCurrent: true }
    ]}>
      <div className="w-full mx-auto p-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-2">
          <div className="flex items-center gap-6">
            <img src={salonLogo} alt={salon.name} className="w-20 h-20 rounded-full border bg-gray-100 object-cover" />
            <div>
              <h1 className="text-2xl font-bold">{salon.name}</h1>
              <div className="text-gray-500">{salon.city}</div>
              {categoryLabel && (
                <div className="text-sm text-blue-600 font-semibold mt-1">
                  Catégorie : {categoryLabel}
                </div>
              )}
              <Badge variant={
                salon.status?.name === SalonStatusEnum.active
                  ? "outline"
                  : salon.status?.name === SalonStatusEnum.suspended
                    ? "secondary"
                    : "destructive"
              }>
                {salon.status?.name}
              </Badge>
            </div>
          </div>
          <div className="bg-gray-50 rounded-lg p-4 min-w-[220px]">
            <h2 className="font-semibold mb-2 text-sm text-gray-700">Propriétaire</h2>
            <div className="text-sm mb-1"><span className="font-medium">Nom :</span> {owner?.name || "-"}</div>
            <div className="text-sm mb-1"><span className="font-medium">Email :</span> {owner?.email || "-"}</div>
            <div className="text-sm"><span className="font-medium">Téléphone :</span> {owner?.phone || "-"}</div>
          </div>
        </div>

        {/* actions and informations */}
        <div className="mb-8">
          <h2 className="font-semibold mb-2">Informations</h2>
          <div className="text-sm mb-2">{salon.description}</div>
          <div className="flex gap-4 mt-4">
            <Button variant="destructive">
              <Trash2 className="w-4 h-4 mr-2" />
              Supprimer
            </Button>
            <Button variant="secondary">
              <Ban className="w-4 h-4 mr-2" />
              Bloquer
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="flex items-center gap-3 p-4">
            <Calendar className="text-blue-600" />
            <div>
              <div className="text-lg font-bold">{salon.reservationsCount}</div>
              <div className="text-xs text-gray-500">Réservations</div>
            </div>
          </Card>
          <Card className="flex items-center gap-3 p-4">
            <Users className="text-yellow-500" />
            <div>
              <div className="text-lg font-bold">{totalHairdressers}</div>
              <div className="text-xs text-gray-500">Coiffeurs</div>
            </div>
          </Card>
          <Card className="flex items-center gap-3 p-4">
            <Scissors className="text-pink-500" />
            <div>
              <div className="text-lg font-bold">{services.length}</div>
              <div className="text-xs text-gray-500">Services proposés</div>
            </div>
          </Card>
        </div>
        <Tabs defaultValue="reservations" className="">
          <TabsList>
            <TabsTrigger value="reservations">Réservations</TabsTrigger>
            <TabsTrigger value="creaneaux">Créneaux</TabsTrigger>
            <TabsTrigger value="services_categories">Categories de services</TabsTrigger>
            <TabsTrigger value="services">Services</TabsTrigger>
            <TabsTrigger value="hairdressers">Coiffeurs</TabsTrigger>
          </TabsList>
          <TabsContent value="reservations">
            <ReservationsDetails reservationsList={reservationsList} />
          </TabsContent>

          <TabsContent value="creaneaux">
            <TimeSlotsDetails timeSlots={timesSlots} salon={salon} />
          </TabsContent>
          <TabsContent value="services_categories">
            <ServiceCategoriesDetails salon={salon} />
          </TabsContent>
          <TabsContent value="services">
            <ServiceDetails services={services} salon={salon} />
          </TabsContent>
          <TabsContent value="hairdressers">
            <HairDressers salonId={id as string} hairdressers={hairdressers as IHairDresser[]}  />
            <Pagination
              page={page}
              pageSize={PAGE_SIZE}
              total={totalHairdressers}
              onPageChange={setPage}
            />
          </TabsContent>
        </Tabs>
      </div>
    </ProtectedLayout>
  )
}