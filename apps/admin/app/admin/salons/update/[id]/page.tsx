'use client'
import { useEffect, useState } from "react"
import { useForm, Controller, SubmitHandler } from "react-hook-form"
import { Button } from "@zyra/ui/components/button"
import { Input } from "@zyra/ui/components/input"
import PageHeader from "@/presentation/components/common/PageHeader"
import ProtectedLayout from "@/presentation/layouts/ProtectedLayout"
import { ISalonFormValues } from "@zyra/conf/domain/entities/salons.entities"
import { fetchCollection, editDocument } from "@zyra/conf/lib/query"
import { useRouter, useSearchParams } from "next/navigation"
import { toast } from "sonner"
import { Routes } from "@zyra/conf/lib/route"
import { where } from "firebase/firestore"
import { useQueryClient, useQuery } from "@tanstack/react-query"
import * as React from 'react'
export default function UpdateSalon({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const searchParams = useSearchParams();
  const {id} = React.use(params);
  const [loading, setLoading] = useState(false)
  const [initialSalon, setInitialSalon] = useState<ISalonFormValues | null>(null)

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ISalonFormValues>()

  // Load data for the salon to update
  useEffect(() => {
    if (!id) return
    const fetchSalon = async () => {
      const salons = await fetchCollection("salons", [where("id", "==", id as string)])
      if (salons.length === 0) {
        toast.error("Salon introuvable")
        router.replace(Routes.protected.salons.url)
        return
      }
      const salon = salons[0]
      if (!salon) {
        toast.error("Salon introuvable")
        router.replace(Routes.protected.salons.url)
        return
      }
      const salonFormValues: ISalonFormValues = {
        name: salon.name || "",
        description: salon.description || "",
        phone: salon.phone || "",
        address: salon.address || "",
        city: salon.city || "",
        country: salon.country || "",
        email: salon.email || "",
        location_lat: salon.location_lat || "",
        location_lng: salon.location_lng || "",
        location: salon.location || null,
        ownerName: salon.ownerName || "",
        ownerPhone: salon.ownerPhone || "",
        ownerEmail: salon.ownerEmail || "",
        password: "",
        confirmPassword: "",
        openingHours: salon.openingHours || [],
        photos: salon.photos || [],
        category: salon.category || "", 
      }
      reset(salonFormValues)
      setInitialSalon(salonFormValues)
    }
    fetchSalon()
  }, [id, reset, router])

  // Fetch salon categories
  const { data: categories = [], isLoading: loadingCategories } = useQuery({
    queryKey: ['salon-categories'],
    queryFn: async () => {
      const res = await fetchCollection('salon_categories')
      return res.filter((cat: any) => cat.active !== false)
    },
  })

  // Fetch countries
  const { data: countries = [], isLoading: loadingCountries } = useQuery({
    queryKey: ['countries'],
    queryFn: async () => {
      const res = await fetchCollection('countries')
      return res.filter((c: any) => c.active !== false)
    },
  })

  const onSubmit: SubmitHandler<ISalonFormValues> = async (data) => {
    setLoading(true)
    try {
      await editDocument("salons", id as string, {
        ...data,
      })
      queryClient.invalidateQueries({ queryKey: ['salons'] })
      toast.success("Salon modifié avec succès")
      router.push(Routes.protected.salons.url)
    } catch (e) {
      toast.error("Erreur lors de la modification du salon")
    }
    setLoading(false)
  }

  if (!initialSalon) {
    return (
      <>
        <PageHeader 
          title="Modifier un salon"
          breadcrumbs={[
            { label: "Dashboard", href: "/" },
            { label: "Salons", href: "/salons" },
            { label: "Chargement...", isCurrent: true }
          ]}
        />
        <div className="p-8 text-center">Chargement...</div>
      </>
    )
  }

  return (
    <>
      <PageHeader 
        title="Modifier un salon"
        breadcrumbs={[
          { label: "Dashboard", href: "/" },
          { label: "Salons", href: "/salons" },
          { label: "Modifier", isCurrent: true }
        ]}
      />

      <div className="w-full mx-2 flex flex-col md:flex-row gap-8">
        <div className="flex-1 w-2/3 bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold mb-2 text-gray-800">Informations du salon</h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block font-medium mb-1">Nom *</label>
                <Controller
                  name="name"
                  control={control}
                  rules={{ required: "Nom requis" }}
                  render={({ field }) => (
                    <Input {...field} placeholder="Ex: Salon Prestige" />
                  )}
                />
                {errors.name && <span className="text-red-500 text-xs">{errors.name.message}</span>}
              </div>
              <div>
                <label className="block font-medium mb-1">Téléphone *</label>
                <Controller
                  name="phone"
                  control={control}
                  rules={{ required: "Numéro requis" }}
                  render={({ field }) => (
                    <Input {...field} placeholder="Ex: +237 6 99 99 99 99" />
                  )}
                />
                {errors.phone && <span className="text-red-500 text-xs">{errors.phone.message}</span>}
              </div>
              <div>
                <label className="block font-medium mb-1">Adresse *</label>
                <Controller
                  name="address"
                  control={control}
                  rules={{ required: "Adresse requise" }}
                  render={({ field }) => (
                    <Input {...field} placeholder="Ex: 123 Rue de la Beauté, Bonapriso" />
                  )}
                />
                {errors.address && <span className="text-red-500 text-xs">{errors.address.message}</span>}
              </div>
              <div>
                <label className="block font-medium mb-1">Ville / Quartier *</label>
                <Controller
                  name="city"
                  control={control}
                  rules={{ required: "Ville requise" }}
                  render={({ field }) => (
                    <Input {...field} placeholder="Ex: Douala" />
                  )}
                />
                {errors.city && <span className="text-red-500 text-xs">{errors.city.message}</span>}
              </div>
              <div>
                <label className="block font-medium mb-1">Email (pro)</label>
                <Controller
                  name="email"
                  control={control}
                  render={({ field }) => (
                    <Input {...field} type="email" placeholder="Ex: contact@salonprestige.com" />
                  )}
                />
              </div>
              <div>
                <label className="block font-medium mb-1">Coordonnées GPS *</label>
                <div className="flex gap-2">
                  <Controller
                    name="location_lat"
                    control={control}
                    rules={{ required: "Latitude requise", min: 0 }}
                    render={({ field }) => (
                      <Input {...field} type="number" step="any" placeholder="Latitude (ex: 4.0511)" />
                    )}
                  />
                  <Controller
                    name="location_lng"
                    control={control}
                    rules={{ required: "Longitude requise", min: 0 }}
                    render={({ field }) => (
                      <Input {...field} type="number" step="any" placeholder="Longitude (ex: 9.7679)" />
                    )}
                  />
                </div>
                {(errors.location_lat || errors.location_lng) && (
                  <span className="text-red-500 text-xs">
                    {errors.location_lat?.message || errors.location_lng?.message}
                  </span>
                )}
              </div>
              <div>
                <label className="block font-medium mb-1">Catégorie du salon *</label>
                <Controller
                  name="category"
                  control={control}
                  rules={{ required: "Catégorie requise" }}
                  render={({ field }) => (
                    <select
                      {...field}
                      className="w-full border rounded px-3 py-2"
                      disabled={loadingCategories}
                    >
                      <option value="">Sélectionnez une catégorie</option>
                      {categories.map((cat: any) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  )}
                />
                {errors.category && <span className="text-red-500 text-xs">{errors.category.message}</span>}
              </div>
              <div>
                <label className="block font-medium mb-1">Pays *</label>
                <Controller
                  name="country"
                  control={control}
                  rules={{ required: "Pays requis" }}
                  render={({ field }) => (
                    <select
                      {...field}
                      className="w-full border rounded px-3 py-2"
                      disabled={loadingCountries}
                    >
                      <option value="">Sélectionnez un pays</option>
                      {countries.map((country: any) => (
                        <option key={country.id} value={country.id}>
                          {country.name}
                        </option>
                      ))}
                    </select>
                  )}
                />
                {errors.country && <span className="text-red-500 text-xs">{errors.country.message}</span>}
              </div>
            </div>
            <div>
              <label className="block font-medium mb-1">Description *</label>
              <Controller
                name="description"
                control={control}
                rules={{ required: "Description requise" }}
                render={({ field }) => (
                  <textarea
                    {...field}
                    className="min-h-[80px] w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-200"
                    placeholder="Ex: Salon moderne et convivial pour toute la famille"
                  />
                )}
              />
              {errors.description && <span className="text-red-500 text-xs">{errors.description.message}</span>}
            </div>
            <div>
              <label className="block font-medium mb-1">Horaires d’ouverture *</label>
              <Controller
                control={control}
                name="openingHours"
                rules={{
                  validate: (value) =>
                    value.every(
                      (h: any) => h.open && h.close
                    ) || "Tous les horaires doivent être remplis",
                }}
                render={({ field }) => (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {field.value.map((hour: any, idx: number) => (
                      <div key={hour.day} className="flex items-center gap-2 bg-gray-50 rounded px-2 py-1">
                        <span className="w-24 font-medium text-gray-700">{hour.day}</span>
                        <Input
                          type="time"
                          value={hour.open}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                            const newHours = [...field.value]
                            if (newHours[idx]) {
                              newHours[idx].open = e.target.value
                              field.onChange(newHours)
                            }
                          }}
                          placeholder="09:00"
                          className="w-[90px]"
                        />
                        <span>-</span>
                        <Input
                          type="time"
                          value={hour.close}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                            const newHours = [...field.value]
                            if (newHours[idx]) {
                              newHours[idx].close = e.target.value
                              field.onChange(newHours)
                            }
                          }}
                          placeholder="21:00"
                          className="w-[90px]"
                        />
                      </div>
                    ))}
                  </div>
                )}
              />
              {errors.openingHours && (
                <span className="text-red-500 text-xs">{errors.openingHours.message as string}</span>
              )}
            </div>
            <div>
              <label className="block font-medium mb-1">Photos</label>
              <Controller
                name="photos"
                control={control}
                render={({ field }) => (
                  <Input
                    type="file"
                    multiple
                    accept="image/*"
                    placeholder="Sélectionnez des photos"
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => field.onChange(e.target.files)}
                  />
                )}
              />
              <span className="text-xs text-gray-400">Formats acceptés : jpg, png, jpeg. Max 5 photos.</span>
            </div>
            <div className="flex justify-end pt-4">
              <Button type="submit" className="w-full md:w-auto px-8 py-2 text-base font-semibold" disabled={loading}>
                {loading ? "Enregistrement..." : "Enregistrer les modifications"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}