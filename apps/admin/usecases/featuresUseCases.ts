import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { fetchCollectionPaginate } from '@zyra/conf/lib/query'
import { deleteDoc, doc, addDoc, collection, updateDoc } from 'firebase/firestore'
import { db } from '@zyra/conf/lib/firebase'
import { where } from 'firebase/firestore'
import { FeatureData, FeatureDisplayData } from '@zyra/conf/domain/entities/features.entities'
import { FeatureTypeEnum } from '@zyra/conf/domain/enums/FeatureTypeEnum'
import { getFeatureTranslation, LanguageCode } from '../data/featuresTranslations'

export const useFeaturesUseCases = () => {
  const queryClient = useQueryClient()

  // Fonction pour enrichir les features avec les traductions
  const enrichFeaturesWithTranslations = (
    features: any[], 
    language: LanguageCode = 'fr'
  ): FeatureDisplayData[] => {
    return features.map(feature => {
      const translation = getFeatureTranslation(feature.key, language)
      return {
        ...feature,
        name: translation.name,
        description: translation.description
      }
    })
  }

  // Fetch paginated features with filters and translations
  const useFeatures = (options?: {
    page?: number
    pageSize?: number
    searchTerm?: string
    filterType?: 'all' | FeatureTypeEnum
    language?: LanguageCode
  }) => {
    const { 
      page = 1, 
      pageSize = 10, 
      searchTerm = '', 
      filterType = 'all',
      language = 'fr'
    } = options || {}

    return useQuery({
      queryKey: ['features', page, pageSize, searchTerm, filterType, language],
      queryFn: async () => {
        const constraints = []
        
        // Add type filter constraint
        if (filterType !== 'all') {
          constraints.push(where("type", "==", filterType))
        }

        const result = await fetchCollectionPaginate('features', {
          page,
          pageSize,
          constraints,
          orderByField: 'createdAt'
        })

        // Enrichir avec les traductions
        const enrichedFeatures = enrichFeaturesWithTranslations(result.data, language)

        // Apply text search filter on the client side if needed (sur les textes traduits)
        if (searchTerm) {
          const filteredData = enrichedFeatures.filter((feature: FeatureDisplayData) => 
            feature.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            feature.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            feature.key?.toLowerCase().includes(searchTerm.toLowerCase())
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
          data: enrichedFeatures,
          total: result.total,
          currentPage: page,
          pageSize,
          totalPages: Math.ceil(result.total / pageSize)
        }
      },
    })
  }

  // Create feature (sans name/description, juste key)
  const useCreateFeature = () => {
    return useMutation({
      mutationFn: async (featureData: Omit<FeatureData, 'id' | 'createdAt' | 'updatedAt'>) => {
        const newFeature = {
          ...featureData,
          createdAt: new Date(),
          updatedAt: new Date(),
        }
        const docRef = await addDoc(collection(db, 'features'), newFeature)
        return docRef.id
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['features'] })
        toast.success('Fonctionnalité créée avec succès')
      },
      onError: (error: any) => {
        toast.error('Erreur lors de la création: ' + error.message)
      },
    })
  }

  // Update feature
  const useUpdateFeature = () => {
    return useMutation({
      mutationFn: async ({ id, data }: { id: string; data: Partial<FeatureData> }) => {
        const updatedData = {
          ...data,
          updatedAt: new Date(),
        }
        await updateDoc(doc(db, 'features', id), updatedData)
        return id
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['features'] })
        toast.success('Fonctionnalité mise à jour avec succès')
      },
      onError: (error: any) => {
        toast.error('Erreur lors de la mise à jour: ' + error.message)
      },
    })
  }

  // Delete feature
  const useDeleteFeature = () => {
    return useMutation({
      mutationFn: async (id: string) => {
        await deleteDoc(doc(db, 'features', id))
        return id
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['features'] })
        toast.success('Fonctionnalité supprimée avec succès')
      },
      onError: (error: any) => {
        toast.error('Erreur lors de la suppression: ' + error.message)
      },
    })
  }

  return {
    useFeatures,
    useCreateFeature,
    useUpdateFeature,
    useDeleteFeature,
    enrichFeaturesWithTranslations,
  }
}
