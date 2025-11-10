'use client'

import React, { useState, useCallback, useMemo, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@zyra/ui/components/button'
import { Input } from '@zyra/ui/components/input'
import { RadioGroup, RadioGroupItem } from '@zyra/ui/components/radio-group'
import {Select,SelectContent,SelectItem,SelectTrigger,SelectValue} from '@zyra/ui/components/select'
import {Dialog,DialogContent,DialogDescription,DialogFooter,DialogHeader,DialogTitle} from '@zyra/ui/components/dialog'
import {Form,FormControl,FormDescription,FormField,FormItem,FormLabel,FormMessage } from '@zyra/ui/components/form'
import { Separator } from '@zyra/ui/components/separator'
import { toast } from 'sonner'
import { Edit, Loader2, Check, AlertTriangle, ShieldAlert, Upload, X } from 'lucide-react'
import { ISalonService, IServiceCategory } from '@zyra/conf/domain/entities/salons.entities'
import { IService } from '@zyra/conf/domain/entities/services.entities'
import { useServices } from '@/usecases/useServices'
import { serviceSchema } from '@/schema/services.schema'
import { serviceValidationService, ServiceAnalysisResult } from '@/services/ServiceValidationService'
import { useQuery } from '@tanstack/react-query'
import ServiceValidationZone from './ServiceValidationZone'
import useSalon from '@/hooks/useSalon'
import { uploadLogoFile } from '@zyra/conf/lib/utils'

const updateServiceSchemaWithFile = serviceSchema.extend({
  image: z.instanceof(File).optional()
}).omit({ imageUrl: true })

type UpdateServiceFormData = z.infer<typeof updateServiceSchemaWithFile>

interface UpdateServiceModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  service: ISalonService | null
  categories: IServiceCategory[]
  salonServices?: ISalonService[]
}

export default function UpdateServiceModal({
  open,
  onOpenChange,
  service,
  categories,
  salonServices = []
}: UpdateServiceModalProps) {
  const { updateService, isUpdating, updateError } = useServices()
  const { salon } = useSalon()
  const [selectedGlobalService, setSelectedGlobalService] = useState<IService | null>(null)
  const [isCreatingGlobal, setIsCreatingGlobal] = useState(false)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const [hasImageChanged, setHasImageChanged] = useState(false)

  const form = useForm<UpdateServiceFormData>({
    resolver: zodResolver(updateServiceSchemaWithFile),
    defaultValues: {
      name: '',
      price: 0,
      duration: 30,
      categoryId: '',
      isActive: true,
      image: undefined,
    },
  })

  const watchedName = form.watch('name')

  // Pré-remplir le formulaire quand le service change
  useEffect(() => {
    if (service && open) {
      form.reset({
        name: service.name || '',
        price: service.price || 0,
        duration: service.duration || 30,
        categoryId: service.categoryId || '',
        isActive: service.isActive !== false,
        image: undefined,
      })
      // Définir l'aperçu de l'image existante
      if (service.imageUrl) {
        setImagePreview(service.imageUrl)
      } else {
        setImagePreview(null)
      }
      setHasImageChanged(false)
      setSelectedGlobalService(null)
    }
  }, [service, open, form])

  // Query pour l'analyse du service en temps réel (seulement si le nom a changé)
  const { data: serviceAnalysis, isLoading: isAnalyzing } = useQuery({
    queryKey: ['service-analysis-update', watchedName, selectedGlobalService?.id, service?.id],
    queryFn: () => serviceValidationService.analyzeServiceName(
      watchedName,
      selectedGlobalService,
      { minNameLength: 4 }
    ),
    enabled: !!watchedName && 
             watchedName.trim().length >= 4 && 
             watchedName.trim() !== service?.name, // Seulement si le nom a changé
    staleTime: 0,
  }) as { data: ServiceAnalysisResult | undefined; isLoading: boolean }

  const analysisResult = useMemo(() => {
    // Si le nom n'a pas changé, pas besoin de validation
    if (watchedName?.trim() === service?.name) {
      return {
        isValid: true,
        isForbidden: false,
        searchResults: [],
        exactMatch: null,
        canCreateGlobal: false,
        shouldShowValidation: false
      }
    }

    return serviceAnalysis || {
      isValid: false,
      isForbidden: false,
      searchResults: [],
      exactMatch: null,
      canCreateGlobal: false,
      shouldShowValidation: watchedName?.trim().length >= 4
    }
  }, [serviceAnalysis, watchedName, service?.name])

  // Gérer le changement d'image
  const handleImageChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validation du type de fichier
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
      if (!allowedTypes.includes(file.type)) {
        toast.error('Format d\'image non supporté. Utilisez JPG, PNG, GIF ou WebP.')
        return
      }
      // Validation de la taille (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('L\'image doit faire moins de 5MB.')
        return
      }
      form.setValue('image', file)
      setHasImageChanged(true)
      // Créer un aperçu
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }, [form])

  // Supprimer l'image sélectionnée
  const handleRemoveImage = useCallback(() => {
    form.setValue('image', undefined)
    setImagePreview(null)
    setHasImageChanged(true)
    // Reset l'input file
    const fileInput = document.getElementById('service-image-update') as HTMLInputElement
    if (fileInput) {
      fileInput.value = ''
    }
  }, [form])

  // Créer un nouveau service global
  const handleCreateGlobalService = useCallback(async () => {
    const trimmedName = watchedName?.trim()
    if (!trimmedName) return
    setIsCreatingGlobal(true)
    try {
      const newService = await serviceValidationService.createGlobalService(trimmedName)
      setSelectedGlobalService(newService)
      toast.success('Service ajouté à la base globale')
    } catch (error) {
      console.error('Erreur lors de la création du service global:', error)
      toast.error(error instanceof Error ? error.message : 'Erreur lors de la création du service global')
    } finally {
      setIsCreatingGlobal(false)
    }
  }, [watchedName])

  const onSubmit = async (data: UpdateServiceFormData) => {
    if (!service) {
      toast.error('Aucun service sélectionné')
      return
    }

    // Vérifications avec le service de validation (seulement si le nom a changé)
    if (data.name.trim() !== service.name) {
      if (analysisResult.isForbidden) {
        toast.error('Ce service n\'est pas autorisé')
        return
      }
      if (!analysisResult.isValid) {
        toast.error('Veuillez d\'abord valider le nom du service')
        return
      }

      // Vérification dans le salon (exclure le service actuel)
      const otherSalonServices = salonServices.filter(s => s.id !== service.id)
      if (serviceValidationService.serviceExistsInSalon(data.name, otherSalonServices)) {
        toast.error(
          `Un autre service avec le nom "${data.name}" existe déjà dans votre salon.`,
          {
            description: 'Veuillez choisir un nom différent pour votre service.',
            duration: 4000,
          }
        )
        return
      }
    }

    // Vérifier s'il y a des changements
    const hasChanges = 
      data.name.trim() !== service.name ||
      data.price !== service.price ||
      data.duration !== service.duration ||
      data.categoryId !== service.categoryId ||
      data.isActive !== (service.isActive !== false) ||
      hasImageChanged

    if (!hasChanges) {
      toast.info('Aucune modification détectée')
      handleClose()
      return
    }

    // Validation des données (sans l'image pour l'instant)
    const validationData = {
      name: data.name,
      price: data.price,
      duration: data.duration,
      categoryId: data.categoryId,
      isActive: data.isActive
    }
    const validation = await serviceValidationService.validateServiceData(validationData)
    if (!validation.valid) {
      toast.error(`Données invalides: ${validation.errors.join(', ')}`)
      return
    }
    if (!salon?.id) {
      toast.error('Salon non trouvé')
      return
    }

    try {
      let imageUrl: string | null = service.imageUrl || null

      // Gérer l'upload/suppression d'image
      if (hasImageChanged) {
        if (data.image) {
          // Nouvelle image uploadée
          setIsUploadingImage(true)
          try {
            imageUrl = await uploadLogoFile(`salons/${salon.id}/services`, data.image)
            toast.success('Image uploadée avec succès')
          } catch (error) {
            console.error('Erreur lors de l\'upload de l\'image:', error)
            toast.error('Erreur lors de l\'upload de l\'image')
            return
          } finally {
            setIsUploadingImage(false)
          }
        } else {
          // Image supprimée
          imageUrl = null
        }
      }

      await updateService(service.id, {
        name: data.name.trim(),
        price: data.price,
        duration: data.duration,
        categoryId: data.categoryId,
        isActive: data.isActive,
        imageUrl: imageUrl,
      })

      toast.success('Service mis à jour avec succès!')
      handleClose()
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error)
      toast.error('Erreur lors de la mise à jour du service')
    }
  }

  const handleClose = useCallback(() => {
    form.reset()
    form.clearErrors()
    setSelectedGlobalService(null)
    setImagePreview(null)
    setHasImageChanged(false)
    onOpenChange(false)
  }, [form, onOpenChange])

  const handleNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    form.setValue('name', value)
    // Reset selection si le nom ne correspond plus exactement
    if (selectedGlobalService && selectedGlobalService.name !== value.trim()) {
      setSelectedGlobalService(null)
    }
    if (form.formState.errors.name) {
      form.clearErrors('name')
    }
  }, [form, selectedGlobalService])

  const activeCategories = useMemo(() => 
    categories.filter(cat => cat.isActive !== false), 
    [categories]
  )

  const inputState = useMemo(() => {
    // Si le nom n'a pas changé, pas d'indicateur visuel
    if (watchedName?.trim() === service?.name) return 'default'
    if (!watchedName || watchedName.trim().length < 4) return 'default'
    if (isAnalyzing) return 'loading'
    if (analysisResult.isForbidden) return 'forbidden'
    if (analysisResult.isValid) return 'valid'
    if (analysisResult.shouldShowValidation) return 'warning'
    return 'default'
  }, [watchedName, isAnalyzing, analysisResult, service?.name])

  const isFormDisabled = isUpdating || isUploadingImage
  const isSubmitDisabled = isFormDisabled || !form.formState.isValid || 
    (watchedName?.trim() !== service?.name && (!analysisResult.isValid || analysisResult.isForbidden))

  // Ne pas afficher le modal si aucun service n'est sélectionné
  if (!service) {
    return null
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit className="h-5 w-5" />
            Modifier le Service
          </DialogTitle>
          <DialogDescription>
            Modifiez les informations du service "{service.name}".
            {watchedName?.trim() !== service?.name && " Minimum 4 caractères requis pour valider le nouveau nom."}
          </DialogDescription>
        </DialogHeader>
        <Form {...(form as any)}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Nom du service avec validation */}
            <FormField
              control={form.control as any}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Nom du service <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        placeholder="Ex: Coupe Homme, Coloration..."
                        value={field.value}
                        onChange={handleNameChange}
                        disabled={isFormDisabled}
                        className={`pr-10 ${
                          inputState === 'forbidden'
                            ? 'border-red-500 bg-red-50'
                            : inputState === 'valid'
                              ? 'border-green-500 bg-green-50' 
                              : inputState === 'warning'
                                ? 'border-orange-500' 
                                : ''
                        }`}
                      />
                      {inputState === 'loading' && (
                        <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin text-gray-400" />
                      )}
                      {inputState === 'forbidden' && (
                        <ShieldAlert className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-red-500" />
                      )}
                      {inputState === 'valid' && (
                        <Check className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-500" />
                      )}
                      {inputState === 'warning' && (
                        <AlertTriangle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-orange-500" />
                      )}
                    </div>
                  </FormControl>
                  <FormDescription>
                    {watchedName && watchedName.trim() !== service?.name && watchedName.trim().length < 4 && (
                      <span className="text-gray-500">
                        Tapez au moins 4 caractères pour déclencher la validation
                      </span>
                    )}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Zone de validation (seulement si le nom a changé) */}
            {watchedName?.trim() !== service?.name && (
              <ServiceValidationZone 
                analysisResult={analysisResult}
                serviceName={watchedName}
                selectedGlobalService={selectedGlobalService}
                isCreatingGlobal={isCreatingGlobal}
                onSelectGlobalService={(globalService) => {
                  setSelectedGlobalService(globalService)
                  toast.success(`Service "${globalService.name}" sélectionné`)
                }}
                onCreateGlobalService={handleCreateGlobalService}
              />
            )}

            <Separator />

            {/* Reste du formulaire - désactivé si service interdit */}
            <div className={`space-y-4 ${analysisResult.isForbidden ? 'opacity-50 pointer-events-none' : ''}`}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control as any}
                  name="categoryId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Catégorie <span className="text-destructive">*</span>
                      </FormLabel>
                      <Select onValueChange={field.onChange} value={field.value} disabled={isFormDisabled}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionner une catégorie" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {activeCategories.map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control as any}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Prix (XAF) <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Ex: 5000"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                          disabled={isFormDisabled}
                        />
                      </FormControl>
                      <FormDescription>Prix en francs CFA</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control as any}
                  name="duration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Durée (minutes) <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Ex: 30"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                          disabled={isFormDisabled}
                        />
                      </FormControl>
                      <FormDescription>Durée en minutes</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Upload d'image */}
                <FormField
                  control={form.control as any}
                  name="image"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Image du service (optionnel)</FormLabel>
                      <FormControl>
                        <div className="space-y-2">
                          {/* Input file caché */}
                          <input
                            id="service-image-update"
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            disabled={isFormDisabled}
                            className="hidden"
                          />
                          
                          {/* Bouton de sélection ou aperçu */}
                          {!imagePreview ? (
                            <label
                              htmlFor="service-image-update"
                              className={`flex flex-col items-center justify-center w-full h-24 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors ${
                                isFormDisabled ? 'opacity-50 cursor-not-allowed' : ''
                              }`}
                            >
                              <div className="flex flex-col items-center justify-center pt-2 pb-3">
                                <Upload className="w-4 h-4 mb-1 text-gray-500" />
                                <p className="text-xs text-gray-500">
                                  Cliquez pour choisir
                                </p>
                              </div>
                            </label>
                          ) : (
                            <div className="relative">
                              <img
                                src={imagePreview}
                                alt="Aperçu"
                                className="w-full h-24 object-cover rounded-lg border"
                              />
                              <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                onClick={handleRemoveImage}
                                disabled={isFormDisabled}
                                className="absolute top-1 right-1 h-6 w-6 p-0"
                              >
                                <X className="h-3 w-3" />
                              </Button>
                              {hasImageChanged && (
                                <div className="absolute bottom-1 left-1 px-2 py-1 bg-blue-500 text-white text-xs rounded">
                                  Modifié
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </FormControl>
                      <FormDescription>
                        JPG, PNG, GIF ou WebP. Max 5MB.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control as any}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Statut</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={(value) => field.onChange(value === 'true')}
                        value={field.value ? 'true' : 'false'}
                        disabled={isFormDisabled}
                        className="flex items-center gap-6"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="true" id="active-update" />
                          <label htmlFor="active-update" className="text-sm font-normal cursor-pointer">
                            Actif
                          </label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="false" id="inactive-update" />
                          <label htmlFor="inactive-update" className="text-sm font-normal cursor-pointer">
                            Inactif
                          </label>
                        </div>
                      </RadioGroup>
                    </FormControl>
                    <FormDescription>
                      Les services inactifs ne seront pas visibles pour la réservation
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Indicateur d'upload d'image */}
            {isUploadingImage && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                <div className="flex items-center gap-3">
                  <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                  <span className="text-sm text-blue-700">Upload de l'image en cours...</span>
                </div>
              </div>
            )}

            {updateError && (
              <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">
                Erreur: {updateError.message || 'Une erreur est survenue'}
              </div>
            )}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleClose} disabled={isFormDisabled}>
                Annuler
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitDisabled}
              >
                {isUpdating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Mise à jour...
                  </>
                ) : isUploadingImage ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Upload...
                  </>
                ) : (
                  'Mettre à jour'
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}