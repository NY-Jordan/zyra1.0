'use client'

import React, { useState, useCallback, useMemo } from 'react'
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
import { Scissors, Loader2, Check, AlertTriangle, ShieldAlert, Upload, X } from 'lucide-react'
import { ISalonService, IServiceCategory } from '@zyra/conf/domain/entities/salons.entities'
import { IService } from '@zyra/conf/domain/entities/services.entities'
import { useServices } from '@/usecases/useServices'
import { serviceSchema, Supplement, supplementSchema } from '@/schema/services.schema'
import { serviceValidationService, ServiceAnalysisResult } from '@/services/ServiceValidationService'
import { useQuery } from '@tanstack/react-query'
import ServiceValidationZone from './ServiceValidationZone'
import ServiceSupplementsManager from './ServiceSupplementsManager'
import useSalon from '@/hooks/useSalon'
import { uploadLogoFile } from '@zyra/conf/lib/utils'

// Modifier le schema pour accepter File au lieu de string pour l'image
const serviceSchemaWithFile = serviceSchema.extend({
  image: z.instanceof(File).optional()
}).omit({ imageUrl: true })

type ServiceFormData = z.infer<typeof serviceSchemaWithFile>

interface CreateServiceModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  categories: IServiceCategory[]
  salonServices?: ISalonService[]
}

export default function CreateServiceModal({
  open,
  onOpenChange,
  categories,
  salonServices = []
}: CreateServiceModalProps) {
  const { createService, isCreating, createError } = useServices()
  const { salon } = useSalon()
  const [selectedGlobalService, setSelectedGlobalService] = useState<IService | null>(null)
  const [isCreatingGlobal, setIsCreatingGlobal] = useState(false)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isUploadingImage, setIsUploadingImage] = useState(false)

  const form = useForm<ServiceFormData>({
    resolver: zodResolver(serviceSchemaWithFile),
    defaultValues: {
      name: '',
      price: 0,
      duration: 30,
      categoryId: '',
      isActive: true,
      image: undefined,
      supplements: [],
    },
  })

  const watchedName = form.watch('name')

  // Query pour l'analyse du service en temps réel
  const { data: serviceAnalysis, isLoading: isAnalyzing } = useQuery({
    queryKey: ['service-analysis', watchedName, selectedGlobalService?.id],
    queryFn: () => serviceValidationService.analyzeServiceName(
      watchedName,
      selectedGlobalService,
      { minNameLength: 4 }
    ),
    enabled: !!watchedName && watchedName.trim().length >= 4,
    staleTime: 0,
  }) as { data: ServiceAnalysisResult | undefined; isLoading: boolean }

  const analysisResult = serviceAnalysis || {
    isValid: false,
    isForbidden: false,
    searchResults: [],
    exactMatch: null,
    canCreateGlobal: false,
    shouldShowValidation: watchedName?.trim().length >= 4
  }

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
    // Reset l'input file
    const fileInput = document.getElementById('service-image') as HTMLInputElement
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

  const onSubmit = async (data: ServiceFormData) => {
    // Vérifications avec le service de validation
    if (analysisResult.isForbidden) {
      toast.error('Ce service n\'est pas autorisé')
      return
    }
    if (!analysisResult.isValid) {
      toast.error('Veuillez d\'abord valider le nom du service')
      return
    }
    // Vérification dans le salon
    if (serviceValidationService.serviceExistsInSalon(data.name, salonServices)) {
      toast.error(
        `Un service avec le nom "${data.name}" existe déjà dans votre salon.`,
        {
          description: 'Veuillez choisir un nom différent pour votre service.',
          duration: 4000,
        }
      )
      return
    }

    // Validation des données (sans l'image pour l'instant)
    const validationData = {
      name: data.name,
      price: data.price,
      duration: data.duration,
      categoryId: data.categoryId,
      isActive: data.isActive,
      supplements : data.supplements
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
      let imageUrl: string | null = null
      // Upload de l'image si présente
      if (data.image) {
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
      }
      await createService({
        name: data.name.trim(),
        price: data.price,
        duration: data.duration,
        categoryId: data.categoryId,
        isActive: data.isActive,
        supplements: data.supplements || [],
        imageUrl: imageUrl,
      })
      toast.success('Service créé avec succès!')
      handleClose()
    } catch (error) {
      console.error('Erreur lors de la création:', error)
      toast.error('Erreur lors de la création du service')
    }
  }

  const handleClose = useCallback(() => {
    form.reset()
    form.clearErrors()
    setSelectedGlobalService(null)
    setImagePreview(null)
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
    if (!watchedName || watchedName.trim().length < 4) return 'default'
    if (isAnalyzing) return 'loading'
    if (analysisResult.isForbidden) return 'forbidden'
    if (analysisResult.isValid) return 'valid'
    if (analysisResult.shouldShowValidation) return 'warning'
    return 'default'
  }, [watchedName, isAnalyzing, analysisResult])

  const isFormDisabled = isCreating || isUploadingImage
  const isSubmitDisabled = isFormDisabled || !form.formState.isValid || !analysisResult.isValid || analysisResult.isForbidden

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        showCloseButton={false}
        className="sm:max-w-2xl max-h-[90vh] overflow-y-auto p-0 bg-white dark:bg-[#161B24] border border-[#F0EAE4] dark:border-slate-800/50 rounded-2xl gap-0"
      >
        <DialogHeader className="px-6 pt-6 pb-5 border-b border-[#F0EAE4] dark:border-slate-800/50 space-y-0">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/20 flex-shrink-0">
                <Scissors className="w-5 h-5 text-white" />
              </div>
              <div>
                <DialogTitle className="text-[16px] font-extrabold text-slate-800 dark:text-white leading-tight">
                  Nouveau Service
                </DialogTitle>
                <DialogDescription className="text-[12px] text-slate-400 dark:text-slate-500">
                  Créez un nouveau service pour enrichir votre offre de prestations.
                </DialogDescription>
              </div>
            </div>
            <button
              type="button"
              onClick={handleClose}
              aria-label="Fermer"
              className="w-7 h-7 rounded-full bg-[#F5F2EF] dark:bg-slate-700 flex items-center justify-center text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors flex-shrink-0"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </DialogHeader>
        <Form {...(form as any)}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 px-6 py-5">
            {/* Nom du service avec validation */}
            <FormField
              control={form.control as any}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide">
                    Nom du service <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        placeholder="Ex: Coupe Homme, Coloration..."
                        value={field.value}
                        onChange={handleNameChange}
                        disabled={isFormDisabled}
                        className={`pr-10 h-10 rounded-xl border-[#E8E0D8] dark:border-slate-700 ${
                          inputState === 'forbidden'
                            ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                            : inputState === 'valid'
                              ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20'
                              : inputState === 'warning'
                                ? 'border-orange-500'
                                : ''
                        }`}
                      />
                      {inputState === 'loading' && (
                        <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin text-gray-400 dark:text-slate-500" />
                      )}
                      {inputState === 'forbidden' && (
                        <ShieldAlert className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-red-500" />
                      )}
                      {inputState === 'valid' && (
                        <Check className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-emerald-500" />
                      )}
                      {inputState === 'warning' && (
                        <AlertTriangle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-orange-500" />
                      )}
                    </div>
                  </FormControl>
                  <FormDescription className="text-[12px]">
                    {watchedName && watchedName.trim().length < 4 && (
                      <span className="text-slate-400 dark:text-slate-500">
                        Tapez au moins 4 caractères pour déclencher la validation
                      </span>
                    )}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Zone de validation externalisée */}
            <ServiceValidationZone
              analysisResult={analysisResult}
              serviceName={watchedName}
              selectedGlobalService={selectedGlobalService}
              isCreatingGlobal={isCreatingGlobal}
              onSelectGlobalService={(service) => {
                form.setValue('name', service.name)
                setSelectedGlobalService(service)
                toast.success(`Service "${service.name}" sélectionné`)
              }}
              onCreateGlobalService={handleCreateGlobalService}
            />

            <Separator className="bg-[#F0EAE4] dark:bg-slate-800/50" />

            {/* Reste du formulaire - désactivé si service interdit */}
            <div className={`space-y-4 ${analysisResult.isForbidden ? 'opacity-50 pointer-events-none' : ''}`}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control as any}
                  name="categoryId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide">
                        Catégorie <span className="text-destructive">*</span>
                      </FormLabel>
                      <Select onValueChange={field.onChange} value={field.value} disabled={isFormDisabled}>
                        <FormControl>
                          <SelectTrigger className="h-10 rounded-xl border-[#E8E0D8] dark:border-slate-700">
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
                      <FormLabel className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide">
                        Prix (XAF) <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Ex: 5000"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                          disabled={isFormDisabled}
                          className="h-10 rounded-xl border-[#E8E0D8] dark:border-slate-700"
                        />
                      </FormControl>
                      <FormDescription className="text-[12px]">Prix en francs CFA</FormDescription>
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
                      <FormLabel className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide">
                        Durée (minutes) <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Ex: 30"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                          disabled={isFormDisabled}
                          className="h-10 rounded-xl border-[#E8E0D8] dark:border-slate-700"
                        />
                      </FormControl>
                      <FormDescription className="text-[12px]">Durée en minutes</FormDescription>
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
                      <FormLabel className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide">Image du service (optionnel)</FormLabel>
                      <FormControl>
                        <div className="space-y-2">
                          {/* Input file caché */}
                          <input
                            id="service-image"
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            disabled={isFormDisabled}
                            className="hidden"
                          />
                          {/* Bouton de sélection ou aperçu */}
                          {!imagePreview ? (
                            <label
                              htmlFor="service-image"
                              className={`flex flex-col items-center justify-center w-full h-24 border-2 border-[#E8E0D8] dark:border-slate-700 border-dashed rounded-xl cursor-pointer bg-[#F8F4F0] dark:bg-slate-800/40 hover:bg-[#F5F2EF] dark:hover:bg-slate-800/70 transition-colors ${
                                isFormDisabled ? 'opacity-50 cursor-not-allowed' : ''
                              }`}
                            >
                              <div className="flex flex-col items-center justify-center pt-2 pb-3">
                                <Upload className="w-4 h-4 mb-1 text-slate-400 dark:text-slate-500" />
                                <p className="text-[11px] text-slate-400 dark:text-slate-500">
                                  Cliquez pour choisir
                                </p>
                              </div>
                            </label>
                          ) : (
                            <div className="relative">
                              <img
                                src={imagePreview}
                                alt="Aperçu"
                                className="w-full h-24 object-cover rounded-xl border border-[#E8E0D8] dark:border-slate-700"
                              />
                              <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                onClick={handleRemoveImage}
                                disabled={isFormDisabled}
                                className="absolute top-1 right-1 h-6 w-6 p-0 rounded-full"
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          )}
                        </div>
                      </FormControl>
                      <FormDescription className="text-[12px]">
                        JPG, PNG, GIF ou WebP. Max 5MB.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Section Suppléments */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <h3 className="text-[14px] font-bold text-slate-800 dark:text-white">Suppléments</h3>
                  <span className="text-[12px] text-slate-400 dark:text-slate-500">(optionnel)</span>
                </div>
                <ServiceSupplementsManager
                  control={form.control as any}
                  disabled={isFormDisabled}
                  supplements={[]}
                />
              </div>

              <Separator className="bg-[#F0EAE4] dark:bg-slate-800/50" />

              <FormField
                control={form.control as any}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide">Statut</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={(value) => field.onChange(value === 'true')}
                        value={field.value ? 'true' : 'false'}
                        disabled={isFormDisabled}
                        className="flex items-center gap-6"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="true" id="active" className="text-emerald-500 border-[#E8E0D8] dark:border-slate-700" />
                          <label htmlFor="active" className="text-[13px] font-medium text-slate-600 dark:text-slate-300 cursor-pointer">
                            Actif
                          </label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="false" id="inactive" className="text-emerald-500 border-[#E8E0D8] dark:border-slate-700" />
                          <label htmlFor="inactive" className="text-[13px] font-medium text-slate-600 dark:text-slate-300 cursor-pointer">
                            Inactif
                          </label>
                        </div>
                      </RadioGroup>
                    </FormControl>
                    <FormDescription className="text-[12px]">
                      Les services inactifs ne seront pas visibles pour la réservation
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Indicateur d'upload d'image */}
            {isUploadingImage && (
              <div className="px-3.5 py-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/50 rounded-xl">
                <div className="flex items-center gap-3">
                  <Loader2 className="h-4 w-4 animate-spin text-emerald-600 dark:text-emerald-400" />
                  <span className="text-[12px] font-medium text-emerald-700 dark:text-emerald-300">Upload de l'image en cours...</span>
                </div>
              </div>
            )}

            {createError && (
              <div className="px-3.5 py-3 text-[12px] font-medium text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-800/50 rounded-xl">
                Erreur: {createError.message || 'Une erreur est survenue'}
              </div>
            )}

            <DialogFooter className="-mx-6 -mb-5 mt-2 px-6 py-4 border-t border-[#F0EAE4] dark:border-slate-800/50 bg-[#FAF7F4] dark:bg-slate-800/30 rounded-b-2xl">
              <Button
                type="button"
                variant="ghost"
                onClick={handleClose}
                disabled={isFormDisabled}
                className="h-9 px-4 rounded-xl text-[12px] font-semibold text-slate-500 dark:text-slate-400 hover:bg-[#F0EAE4] dark:hover:bg-slate-700"
              >
                Annuler
              </Button>
              <Button
                type="submit"
                disabled={isSubmitDisabled}
                className="h-9 px-5 rounded-xl text-[12px] font-bold text-white bg-emerald-500 hover:bg-emerald-600 disabled:opacity-60"
              >
                {isCreating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Création...
                  </>
                ) : isUploadingImage ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Upload...
                  </>
                ) : (
                  'Créer le service'
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}