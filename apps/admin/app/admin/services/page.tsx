'use client'
import { Button } from '@zyra/ui/components/button'
import { Input } from '@zyra/ui/components/input'
import PageHeader from '@/presentation/components/common/PageHeader'
import React, { useState } from 'react'
import { Plus } from "lucide-react"
import { useRouter } from 'next/navigation'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import ServicesList from '@/presentation/components/services/ServicesList'
import Pagination from '@/presentation/components/common/Pagination'
import { IService } from '@zyra/conf/domain/entities/services.entities'
import { createDocument, fetchCollectionPaginate } from '@zyra/conf/lib/query';
import { where } from 'firebase/firestore'
import CreateServiceModal from '@/presentation/components/services/CreateServiceModal'
import { toast } from 'sonner'


const PAGE_SIZE = 10

export default function ServicesIndex() {
  const [keyword, setKeyword] = useState("")
  const [statut, setStatut] = useState("Tous les statuts")
  const [validPage, setValidPage] = useState(1)
  const [forbiddenPage, setForbiddenPage] = useState(1)
  const router = useRouter();
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [createLoading, setCreateLoading] = useState(false)
  const queryClient = useQueryClient()


  // Fetch paginated valid services
  const { data: validData = { data: [], total: 0 }, isLoading: loadingValid } = useQuery({
    queryKey: ['services-valid', keyword, statut, validPage],
    queryFn: async () => {
      let res = await fetchCollectionPaginate('services', {
        page: validPage,
        pageSize: PAGE_SIZE,
        constraints : [where('status', '==', true)]
      })
      let filtered = res.data
      if (keyword) {
        filtered = filtered.filter((s: any) =>
          s.name?.toLowerCase().includes(keyword.toLowerCase())
        )
      }
      return { data: filtered, total: res.total }
    },
    refetchOnWindowFocus: true,
  })

  // Fetch paginated forbidden services
  const { data: forbiddenData = { data: [], total: 0 }, isLoading: loadingForbidden } = useQuery({
    queryKey: ['services-forbidden', keyword, statut, forbiddenPage],
    queryFn: async () => {
      let res = await fetchCollectionPaginate('services', {
        page: forbiddenPage,
        pageSize: PAGE_SIZE,
        constraints : [where('status', '==', false)]
      })
      let filtered = res.data
      if (keyword) {
        filtered = filtered.filter((s: any) =>
          s.name?.toLowerCase().includes(keyword.toLowerCase())
        )
      }
      return { data: filtered, total: res.total }
    },
    refetchOnWindowFocus: true,
  })

  // Create new service
  const handleCreateService = async (data: any) => {
    setCreateLoading(true)
    try {
      // verifie if the service already exist
      const allServices = [
        ...((validData?.data as IService[]) || []),
        ...((forbiddenData?.data as IService[]) || [])
      ]
      const alreadyExists = allServices.some(
        s => s.name.trim().toLowerCase() === data.name.trim().toLowerCase()
      )
      if (alreadyExists) {
        toast.error("Ce service existe déjà.")
        setCreateLoading(false)
        return
      }
      await createDocument("services", { ...data, reservations: 0 })
      toast.success("Service créé avec succès");
      queryClient.invalidateQueries({ queryKey: ['services-valid'] })
      queryClient.invalidateQueries({ queryKey: ['services-forbidden'] })
    } catch (e) {
      toast.error("Erreur lors de la création")
    }
    setCreateLoading(false)
    setCreateModalOpen(false)
  }

  return (
    <>
      <PageHeader 
        title="Liste des services"
        breadcrumbs={[
          { label: "Dashboard", href: "/" },
          { label: "Services", isCurrent: true }
        ]}
      />

      <div className="space-y-6">
        <div className="flex flex-wrap justify-between items-center gap-3">
          <div className='flex flex-row gap-2 items-center'>
            {/* Search by service name */}
            <Input
              placeholder="Rechercher un service..."
              className="w-[220px]"
              value={keyword}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setKeyword(e.target.value)}
            />
          </div>
          <Button 
            onClick={() => setCreateModalOpen(true)} 
            className='hover:cursor-pointer' 
            variant="default"
          >
            <Plus className="w-4 h-4 mr-2" />
            Ajouter un service
          </Button>
        </div>

        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-2">Services valides</h2>
          <ServicesList services={validData.data as IService[]} loading={loadingValid} />
          <Pagination
            page={validPage}
            pageSize={PAGE_SIZE}
            total={validData.total}
            onPageChange={setValidPage}
          />
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-2">Services défendus</h2>
          <ServicesList services={forbiddenData.data as IService[]} loading={loadingForbidden} />
          <Pagination
            page={forbiddenPage}
            pageSize={PAGE_SIZE}
            total={forbiddenData.total}
            onPageChange={setForbiddenPage}
          />
        </div>

        {/* Create Service Modal */}
        <CreateServiceModal
          open={createModalOpen}
          onClose={() => setCreateModalOpen(false)}
          onSubmit={handleCreateService}
          loading={createLoading}
        />
      </div>
    </>
  )
}


