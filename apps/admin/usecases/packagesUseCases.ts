import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchCollection, fetchCollectionPaginate } from '@zyra/conf/lib/query'
import { deleteDoc, doc, addDoc, collection, updateDoc } from 'firebase/firestore'
import { db } from '@zyra/conf/lib/firebase'
import { where } from 'firebase/firestore'
import { toast } from 'sonner'
import { PackageData } from '@zyra/conf/domain/entities/packages.entities';



export const usePackagesUseCases = () => {
  const queryClient = useQueryClient()

  // Fetch paginated packages with filters
  const usePackages = (options?: {
    page?: number
    pageSize?: number
    searchTerm?: string
    filterType?: 'all' | 'salon' | 'client'
    filterCountry?: string
  }) => {
    const { 
      page = 1, 
      pageSize = 10, 
      searchTerm = '', 
      filterType = 'all', 
      filterCountry = 'all' 
    } = options || {}

    return useQuery({
      queryKey: ['packages', page, pageSize, searchTerm, filterType, filterCountry],
      queryFn: async () => {
        const constraints = []
        
        // Add type filter constraint
        if (filterType !== 'all') {
          constraints.push(where("type", "==", filterType))
        }
        
        // Add country filter constraint
        if (filterCountry !== 'all' && filterCountry) {
          constraints.push(where("countryId", "==", filterCountry))
        }

        const result = await fetchCollectionPaginate('packages', {
          page,
          pageSize,
          constraints,
          orderByField: 'createdAt'
        })

        // Apply text search filter on the client side if needed
        if (searchTerm) {
          const filteredData = result.data.filter((pkg: any) => 
            pkg.name?.toLowerCase().includes(searchTerm.toLowerCase())
          )
          return {
            data: filteredData,
            total: filteredData.length, // This is approximate for search
            currentPage: page,
            pageSize,
            totalPages: Math.ceil(filteredData.length / pageSize)
          }
        }

        return {
          data: result.data,
          total: result.total,
          currentPage: page,
          pageSize,
          totalPages: Math.ceil(result.total / pageSize)
        }
      },
    })
  }

  // Fetch countries for filters
  const useCountries = () => {
    return useQuery({
      queryKey: ['countries'],
      queryFn: async () => {
        return await fetchCollection('countries', [where("active", "==", true)])
      },
    })
  }

  // Create package mutation
  const useCreatePackage = () => {
    return useMutation({
      mutationFn: async (data: Omit<PackageData, 'id'>) => {
        const docRef = await addDoc(collection(db, 'packages'), {
          ...data,
          createdAt: new Date(),
          updatedAt: new Date()
        })
        return docRef.id
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['packages'] })
        toast.success('Forfait créé avec succès')
      },
      onError: (error) => {
        console.error('Error creating package:', error)
        toast.error('Erreur lors de la création du forfait')
      }
    })
  }

  // Update package mutation
  const useUpdatePackage = () => {
    return useMutation({
      mutationFn: async ({ id, data }: { id: string; data: Partial<PackageData> }) => {
        const docRef = doc(db, 'packages', id)
        await updateDoc(docRef, {
          ...data,
          updatedAt: new Date()
        })
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['packages'] })
        toast.success('Forfait modifié avec succès')
      },
      onError: (error) => {
        console.error('Error updating package:', error)
        toast.error('Erreur lors de la modification du forfait')
      }
    })
  }

  // Delete package mutation
  const useDeletePackage = () => {
    return useMutation({
      mutationFn: async (id: string) => {
        await deleteDoc(doc(db, 'packages', id))
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['packages'] })
        toast.success('Forfait supprimé avec succès')
      },
      onError: (error) => {
        console.error('Error deleting package:', error)
        toast.error('Erreur lors de la suppression du forfait')
      }
    })
  }

  // Toggle package popular status mutation
  const useTogglePackagePopular = () => {
    return useMutation({
      mutationFn: async ({ id, popular }: { id: string; popular: boolean }) => {
        try {
          const packageRef = doc(db, 'packages', id)
          await updateDoc(packageRef, { popular })
          return { success: true }
        } catch (error) {
          console.error('Error toggling package popular status:', error)
          throw new Error('Failed to update package popular status')
        }
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['packages'] })
        toast.success('Statut du forfait mis à jour avec succès')
      },
      onError: (error) => {
        console.error('Error in toggle package popular mutation:', error)
        toast.error('Échec de la mise à jour du forfait')
      }
    })
  }

  // Utility function to filter packages
  const filterPackages = (
    packages: any[],
    searchTerm: string,
    filterType: 'all' | 'salon' | 'client',
    filterCountry: string
  ) => {
    return packages.filter((pkg: any) => {
      const matchesSearch = pkg.name?.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesType = filterType === 'all' || pkg.type === filterType
      const matchesCountry = filterCountry === 'all' || !filterCountry || pkg.countryId === filterCountry
      return matchesSearch && matchesType && matchesCountry
    })
  }

  // Utility function to format price
  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price) + ' ' + currency
  }

 

  return {
    // Hooks
    usePackages,
    useCountries,
    useCreatePackage,
    useUpdatePackage,
    useDeletePackage,
    useTogglePackagePopular,
    
    // Utilities
    filterPackages,
    formatPrice,
  }
}
