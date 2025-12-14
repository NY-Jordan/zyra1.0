'use client'
import { useEffect, useMemo, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@zyra/ui/components/dialog"
import { Input } from "@zyra/ui/components/input"
import { Button } from "@zyra/ui/components/button"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { fetchCollection, fetchSubCollection, createSubCollectionDocument, deleteDocument } from "@zyra/conf/lib/query"
import { where } from "firebase/firestore"
import { HairDresserSalonAssociation, IHairDresser, hairDresserAssociationNameEnum } from "@zyra/conf/domain/entities/hairdressers.entities"
import { ISalon } from "@zyra/conf/domain/entities/salons.entities"
import { toast } from "sonner"
import { ChevronLeft, ChevronRight, Building2, CheckCircle } from "lucide-react"
import { Card, CardContent } from "@zyra/ui/components/card"
import { Separator } from "@zyra/ui/components/separator"

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
  const [currentStep, setCurrentStep] = useState(1) // 1: Sélection salons, 2: Confirmation
  const queryClient = useQueryClient()

  const { data: associatedSalons = [] } = useQuery({
    queryKey: ['salons-associated', hairDresser?.id],
    enabled: open && !!hairDresser,
    queryFn: async () => {
      if (!hairDresser?.id) return []
      const associations = await fetchSubCollection(
        'hair_dressers',
        hairDresser.id,
        hairDresserAssociationNameEnum.SALON_HAIR_DRESSER,
        []
      ) as HairDresserSalonAssociation[]
      if (!associations || associations.length === 0) return []
      const salonIds = associations.map(a => a.salonId)
      return await fetchCollection('salons', [
        where("id", "in", salonIds)
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
}, [associatedSalons, hairDresser])

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
    try {
      // Récupérer les associations actuelles
      const currentAssociations = await fetchSubCollection(
        'hair_dressers',
        hairDresser.id,
        hairDresserAssociationNameEnum.SALON_HAIR_DRESSER,
        []
      ) as HairDresserSalonAssociation[]
      const currentSalonIds = currentAssociations.map(a => a.salonId)
      const selectedSalonIds = selectedSalons.map(s => s.id)
      // Créer les nouvelles associations
      const toAdd = selectedSalonIds.filter(id => !currentSalonIds.includes(id))
      await Promise.all(toAdd.map(salonId => 
        createSubCollectionDocument(
          'hair_dressers',
          hairDresser.id,
          hairDresserAssociationNameEnum.SALON_HAIR_DRESSER,
          {
            salonId,
            active: true,
            categoriesIds: []
          },
          salonId
        )
      ))
      // Supprimer les associations retirées
      const toRemove = currentSalonIds.filter(id => !selectedSalonIds.includes(id))
      await Promise.all(toRemove.map(salonId =>
        deleteDocument(
          `hair_dressers/${hairDresser.id}/${hairDresserAssociationNameEnum.SALON_HAIR_DRESSER}`,
          salonId
        )
      ))
      queryClient.invalidateQueries({ queryKey: ['hair-dressers'] })
      toast.success('Associations mises à jour avec succès!')
      handleClose()
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de la mise à jour')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setCurrentStep(1)
    setSearch('')
    setSelectedSalons([])
    onClose()
  }

  const getStepTitle = () => {
    switch (currentStep) {
      case 1: return 'Sélectionner les salons'
      case 2: return 'Confirmer les associations'
      default: return 'Salons associés'
    }
  }

  const canProceedToNextStep = () => {
    return selectedSalons.length > 0
  }

  

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            {getStepTitle()} - {hairDresser?.name}
          </DialogTitle>
          {/* Progress bar */}
          <div className="flex items-center gap-2 mt-2">
            {[1, 2].map((step) => (
              <div
                key={step}
                className={`h-2 flex-1 rounded-full ${
                  step <= currentStep ? 'bg-primary' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Étape 1: Sélection des salons */}
          {currentStep === 1 && (
            <>
              <div className="mb-4">
                <Input
                  placeholder="Rechercher un salon par nom..."
                  value={search}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
                />
              </div>

              {/* Salons sélectionnés */}
              {selectedSalons.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold mb-3">
                    Salons sélectionnés ({selectedSalons.length})
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
                    {selectedSalons.map((salon: ISalon) => (
                      <Card key={salon.id} className="border-2 border-primary">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <div className="font-bold text-base">{salon.name}</div>
                              <div className="text-sm text-gray-500">{salon.city}</div>
                            </div>
                            <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                          </div>
                          <div className="mb-3">
                            <span className={`px-2 py-1 rounded text-xs ${salon.status.name === "active" ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-600"}`}>
                              {salon.status.name}
                            </span>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            className="w-full"
                            onClick={() => handleRemoveSalon(salon.id)}
                          >
                            Retirer
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Résultats de recherche */}
              {search && (
                <div>
                  <h3 className="text-sm font-semibold mb-3">Résultats de recherche</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {searching ? (
                      <div className="col-span-full text-center py-8 text-gray-400">
                        Recherche...
                      </div>
                    ) : (
                      filteredSalons
                        .filter(s => !selectedSalons.find((sel) => sel.id === s.id))
                        .map((salon) => {
                          const typedSalon = salon as ISalon
                          return (
                            <Card key={typedSalon.id} className="hover:shadow-md transition-shadow">
                              <CardContent className="p-4">
                                <div className="font-bold text-base mb-1">{typedSalon.name}</div>
                                <div className="text-sm text-gray-500 mb-3">{typedSalon.city}</div>
                                <div className="mb-3">
                                  <span className={`px-2 py-1 rounded text-xs ${typedSalon.status.name === "active" ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-600"}`}>
                                    {typedSalon.status.name}
                                  </span>
                                </div>
                                <Button
                                  size="sm"
                                  variant="default"
                                  className="w-full"
                                  onClick={() => handleAddSalon(typedSalon)}
                                >
                                  Associer
                                </Button>
                              </CardContent>
                            </Card>
                          )
                        })
                    )}
                    {!searching && search && filteredSalons.filter((s: any) => !selectedSalons.find((sel) => sel.id === s.id)).length === 0 && (
                      <div className="col-span-full text-center py-8 text-gray-400">
                        Aucun salon trouvé
                      </div>
                    )}
                  </div>
                </div>
              )}

              {!search && selectedSalons.length === 0 && (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500">
                      Aucun salon sélectionné
                    </p>
                    <p className="text-xs text-gray-400 mt-2">
                      Utilisez la recherche ci-dessus pour trouver et associer des salons
                    </p>
                  </CardContent>
                </Card>
              )}
            </>
          )}

          {/* Étape 2: Confirmation */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <CheckCircle className="h-6 w-6 text-blue-600 flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
                        Confirmation des associations
                      </h3>
                      <p className="text-sm text-blue-800 dark:text-blue-200">
                        Vous êtes sur le point d'associer <strong>{hairDresser?.name}</strong> aux salons suivants.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div>
                <h3 className="text-sm font-semibold mb-3">
                  Salons à associer ({selectedSalons.length})
                </h3>
                <div className="space-y-3">
                  {selectedSalons.map((salon: ISalon) => (
                    <Card key={salon.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <CheckCircle className="h-5 w-5 text-green-600" />
                            <div>
                              <div className="font-semibold">{salon.name}</div>
                              <div className="text-sm text-gray-500">{salon.city}</div>
                            </div>
                          </div>
                          <span className={`px-3 py-1 rounded text-xs font-medium ${salon.status.name === "active" ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-600"}`}>
                            {salon.status.name}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              <Separator />

              <div className="text-sm text-gray-600 bg-gray-50 p-4 rounded-lg">
                <p className="font-medium mb-2">Informations :</p>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>Le coiffeur sera associé à {selectedSalons.length} salon{selectedSalons.length > 1 ? 's' : ''}</li>
                  <li>Les associations seront créées avec le statut "actif"</li>
                  <li>Vous pourrez configurer les catégories de services ultérieurement</li>
                </ul>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <div className="flex items-center justify-between w-full">
            <Button
              variant="outline"
              onClick={() => {
                if (currentStep === 1) {
                  handleClose()
                } else {
                  setCurrentStep(1)
                }
              }}
              disabled={loading}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              {currentStep === 1 ? 'Annuler' : 'Précédent'}
            </Button>

            <Button
              onClick={() => {
                if (currentStep === 1) {
                  setCurrentStep(2)
                } else {
                  handleSave()
                }
              }}
              disabled={!canProceedToNextStep() || loading}
            >
              {loading ? (
                <>
                  Enregistrement...
                </>
              ) : currentStep === 2 ? (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Confirmer les associations
                </>
              ) : (
                <>
                  Suivant
                  <ChevronRight className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}