'use client'
import React, { useState, useEffect } from 'react'
import { useForm, Controller, SubmitHandler, useFieldArray } from "react-hook-form"
import { Input } from '@zyra/ui/components/input'
import { Button } from '@zyra/ui/components/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@zyra/ui/components/dialog'
import { X } from 'lucide-react'
import { ISalonServiceForm } from '@zyra/conf/domain/entities/salons.entities'
import { fetchCollection, createDocument } from '@zyra/conf/lib/query'
import { generateUniqueId, initServiceParams, isForbiddenService, levenshtein } from '@zyra/conf/lib/config'
import { IService } from '@zyra/conf/domain/entities/services.entities'
import { toast } from 'sonner'



interface CreateServiceModalProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: ISalonServiceForm) => void
  loading?: boolean
  serviceCategories: { id: string, name: string }[] // Ajout de la prop
}


export default function CreateServiceModal({ open, onClose, onSubmit, loading, serviceCategories }: CreateServiceModalProps) {
  const { control, handleSubmit, formState: { errors }, reset, watch, setValue } = useForm<ISalonServiceForm>({
    defaultValues: {
      supplements: [],
      image: null,
      categoryId: "",
    }
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: "supplements"
  })
  const [allServiceResults, setAllServiceResults] = useState<IService[]>([])
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [serviceSearch, setServiceSearch] = useState("")
  const [serviceResults, setServiceResults] = useState<IService[]>([])
  const [serviceLoading, setServiceLoading] = useState(false)
  const [showCreateBtn, setShowCreateBtn] = useState(false)

  const supplements = watch("supplements") || []
  const basePrice = Number(watch("price") || 0)
  const baseDuration = Number(watch("duration") || 0)
  const supplementsPrice = supplements.reduce((acc, s) => acc + Number(s.price || 0), 0)
  const supplementsDuration = supplements.reduce((acc, s) => acc + Number(s.duration || 0), 0)
  const totalPrice = basePrice + supplementsPrice
  const totalDuration = baseDuration + supplementsDuration

  const handleFormSubmit: SubmitHandler<ISalonServiceForm> = async (data) => {
    onSubmit({...data})
    reset()
    setImagePreview(null)
    onClose()
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    setValue("image", file || null)
    if (file) {
      const reader = new FileReader()
      reader.onload = (ev) => setImagePreview(ev.target?.result as string)
      reader.readAsDataURL(file)
    } else {
      setImagePreview(null)
    }
  }

  const handleRemoveImage = () => {
    setValue("image", null)
    setImagePreview(null)
  }

  // Search services in DB as user types
  useEffect(() => {
    if (!serviceSearch.trim()) {
      setServiceResults([])
      setShowCreateBtn(false)
      return
    }
    setServiceLoading(true)
    fetchCollection('services').then((res: any[]) => {
      setAllServiceResults(res);
      const filtered = res.filter(s =>
        s.name?.toLowerCase().includes(serviceSearch.trim().toLowerCase()) &&
        s.status === true // Only show valid services
      )
      setServiceResults(filtered)
      setShowCreateBtn(!filtered.some(s => s.name?.toLowerCase() === serviceSearch.trim().toLowerCase()))
      setServiceLoading(false)
    })
  }, [serviceSearch])

  // When user selects a service from dropdown
  const handleSelectService = (service: IService) => {
    setValue("name", service.name)
    setServiceSearch(service.name)
    setServiceResults([])
    setShowCreateBtn(false)
  }

  const handleCreateService = async () => {
    if (!serviceSearch.trim()) return
    if (isForbiddenService(serviceSearch.trim(), allServiceResults.filter(s => s.status === false))) {
      toast.error("Ce service est défendu sur la plateforme.")
      return
    }
    const service = {
      ...initServiceParams(serviceSearch.trim()),
    }
    await createDocument('services', service)
    setValue("name", serviceSearch.trim())
    setServiceResults([])
    setShowCreateBtn(false)
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Ajouter un service</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div>
            <label className="block font-medium mb-1">Catégorie de service *</label>
            <Controller
              name="categoryId"
              control={control}
              rules={{ required: "Catégorie requise" }}
              render={({ field }) => (
                <select
                  {...field}
                  className="border rounded px-2 py-2 w-full"
                  value={field.value}
                  onChange={e => field.onChange(e.target.value)}
                >
                  <option value="">Sélectionner une catégorie</option>
                  {serviceCategories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              )}
            />
            {errors.categoryId && <span className="text-red-500 text-xs">{errors.categoryId.message}</span>}
          </div>
          <div>
            <label className="block font-medium mb-1">Nom du service *</label>
            <Controller
              name="name"
              control={control}
              rules={{ required: "Nom requis" }}
              render={({ field }) => (
                <div className="relative">
                  <Input
                    {...field}
                    value={serviceSearch}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      field.onChange(e)
                      setServiceSearch(e.target.value)
                    }}
                    placeholder="Ex: Coupe homme"
                    autoComplete="off"
                  />
                  {/* Dropdown for search results */}
                  {serviceSearch && serviceResults.length > 0 && (
                    <div className="absolute z-10 bg-white border rounded shadow w-full mt-1 max-h-40 overflow-auto">
                      {serviceResults.map((s, idx) => (
                        <div
                          key={s.id || idx}
                          className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                          onClick={() => handleSelectService(s)}
                        >
                          {s.name}
                        </div>
                      ))}
                    </div>
                  )}
                  {/* Button to create if not found */}
                  {serviceSearch && showCreateBtn && !serviceLoading && (
                    <button
                      type="button"
                      className="mt-2 text-blue-600 text-sm underline"
                      onClick={handleCreateService}
                    >
                      Créer « {serviceSearch} »
                    </button>
                  )}
                </div>
              )}
            />
            {errors.name && <span className="text-red-500 text-xs">{errors.name.message}</span>}
          </div>
          <div>
            <label className="block font-medium mb-1">Prix *</label>
            <Controller
              name="price"
              control={control}
              rules={{ required: "Prix requis", min: { value: 0, message: "Prix invalide" } }}
              render={({ field }) => (
                <Input {...field} type="number" min={0} placeholder="Ex: 5000" />
              )}
            />
            {errors.price && <span className="text-red-500 text-xs">{errors.price.message}</span>}
          </div>
          <div>
            <label className="block font-medium mb-1">Durée (min) *</label>
            <Controller
              name="duration"
              control={control}
              rules={{ required: "Durée requise", min: { value: 0, message: "Durée invalide" } }}
              render={({ field }) => (
                <Input {...field} type="number" min={0} placeholder="Ex: 30" />
              )}
            />
            {errors.duration && <span className="text-red-500 text-xs">{errors.duration.message}</span>}
          </div>
          <div>
            <label className="block font-medium mb-1">Image (optionnelle)</label>
            <Input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
            />
            {imagePreview && (
              <div className="mt-2 relative w-fit">
                <img src={imagePreview} alt="Aperçu" className="w-24 h-24 object-cover rounded border" />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="absolute -top-2 -right-2 bg-white border border-gray-300 rounded-full p-1 shadow hover:bg-gray-100"
                  aria-label="Retirer l'image"
                >
                  <X className="w-4 h-4 text-gray-600" />
                </button>
              </div>
            )}
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block font-medium">Suppléments</label>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => append({ id: generateUniqueId(), name: "", price: 0, duration: 0 })}
              >
                Ajouter un supplément
              </Button>
            </div>
            {fields.map((item, idx) => (
              <div key={item.id} className="flex gap-2 mb-2 items-center">
                <Controller
                  name={`supplements.${idx}.name`}
                  control={control}
                  rules={{ required: "Nom requis" }}
                  render={({ field }) => (
                    <Input {...field} placeholder="Nom" className="w-32" />
                  )}
                />
                <Controller
                  name={`supplements.${idx}.price`}
                  control={control}
                  rules={{ required: "Prix requis", min: { value: 0, message: "Prix invalide" } }}
                  render={({ field }) => (
                    <Input {...field} type="number" min={0} placeholder="Prix" className="w-24" />
                  )}
                />
                <Controller
                  name={`supplements.${idx}.duration`}
                  control={control}
                  rules={{ required: "Durée requise", min: { value: 0, message: "Durée invalide" } }}
                  render={({ field }) => (
                    <Input {...field} type="number" min={0} placeholder="Durée (min)" className="w-28" />
                  )}
                />
                <Button type="button" size="icon" variant="destructive" onClick={() => remove(idx)}>
                  ×
                </Button>
              </div>
            ))}
          </div>
          <div className="flex flex-col gap-1 text-sm">
            <span>
              <b>Prix total :</b> {totalPrice} FCFA
            </span>
            <span>
              <b>Durée totale :</b> {totalDuration} min
            </span>
          </div>
          <DialogFooter>
            <Button variant="outline" type="button" onClick={onClose} disabled={loading}>Annuler</Button>
            <Button
              type="submit"
              disabled={
                loading ||
                serviceLoading ||
                !serviceSearch.trim() ||
                !watch("categoryId") || // Blocage si pas de catégorie sélectionnée
                (showCreateBtn && !serviceLoading)
              }
            >
              {loading ? "Enregistrement..." : "Enregistrer le service"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}