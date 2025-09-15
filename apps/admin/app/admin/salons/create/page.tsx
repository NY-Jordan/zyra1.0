'use client'
import React, { useState } from "react"
import { useForm, Controller, SubmitHandler } from "react-hook-form"
import { Button } from "@zyra/ui/components/button"
import { Input } from "@zyra/ui/components/input"
import PageHeader from "@/presentation/components/common/PageHeader"
import ProtectedLayout from "@/presentation/layouts/ProtectedLayout"
import { ISalonFormValues, OpeningHour } from "@zyra/conf/domain/entities/salons.entities"
import { createSalon, checkOwnerExists } from "@/services/SalonServices"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@zyra/ui/components/dialog"
import { generatePassword } from "@zyra/conf/lib/utils"
import { toast } from "sonner"
import { Routes } from "@zyra/conf/lib/route"
import { useRouter } from "next/navigation"
import { fetchCollection } from "@zyra/conf/lib/query"
import { where } from "firebase/firestore"
import { useQueryClient, useQuery } from "@tanstack/react-query"
import { defaultOpeningHours } from "@zyra/conf/lib/config"

export default function CreateSalon() {
  const [generatedPwd, setGeneratedPwd] = useState("")
  const [showOwnerModal, setShowOwnerModal] = useState(false)
  const [pendingSalonData, setPendingSalonData] = useState<any>(null)
  const [pendingOwnerData, setPendingOwnerData] = useState<any>(null);
  const router = useRouter();
  const queryClient = useQueryClient();
  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ISalonFormValues>({
    defaultValues: {
      openingHours: defaultOpeningHours,
    },
  })

  // Fetch salon categories (actives)
  const { data: categories = [], isLoading: loadingCategories } = useQuery({
    queryKey: ['salon-categories'],
    queryFn: async () => {
      const res = await fetchCollection('salon_categories', [where("active", "==", true)])
      return res.filter((cat: any) => cat.active !== false)
    },
  })

  // Fetch countries (actives)
  const { data: countries = [], isLoading: loadingCountries } = useQuery({
    queryKey: ['countries'],
    queryFn: async () => {
      const res = await fetchCollection('countries', [where("active", "==", true)])
      return res.filter((c: any) => c.active !== false)
    },
  })

  const onSubmit: SubmitHandler<ISalonFormValues> = async (data) => {
    const { ownerName, ownerPhone, ownerEmail, password, confirmPassword, ...salonData } = data
    const owner = {
      name: ownerName,
      phone: ownerPhone,
      email: ownerEmail,
      password,
      confirmPassword,
    }
      const openingHoursWithOpenDay = (salonData.openingHours || []).map(h => ({
        ...h,
        openDay: true,
      }))

    const salonsWithSameName = await fetchCollection("salons", [
        where("name", "==", salonData.name)
    ]);
    if (salonsWithSameName.length > 0) {
      toast.error("Un salon avec ce nom existe déjà.")
      return
    }

    // Verify if the owner already exists
    const exists = await checkOwnerExists(owner.email)
    if (exists) {
    setPendingSalonData({ ...salonData, openingHours: openingHoursWithOpenDay })
      setPendingOwnerData(owner)
      setShowOwnerModal(true)
      return
    }
    // create the salon directly if the owner does not exist
    await createSalon({ salon: { ...salonData, openingHours: openingHoursWithOpenDay }, owner })
      queryClient.invalidateQueries({ queryKey: ['salons'] })
      toast.success("Salon créé avec succès");
      router.push(Routes.protected.salons.url)
    }

  // If the user confirms in the modal, continue the creation
  const handleContinueWithExistingOwner = async () => {
    setShowOwnerModal(false)
    if (pendingSalonData && pendingOwnerData) {
      await createSalon({ salon: pendingSalonData, owner: pendingOwnerData, ownerExists: true });
      queryClient.invalidateQueries({ queryKey: ['salons'] })
      toast.success("Salon créé avec succès");
      router.push(Routes.protected.salons.url)
    }
  }

  const handleGeneratePassword = () => {
    const pwd = generatePassword()
    setValue("password", pwd)
    setValue("confirmPassword", pwd)
    setGeneratedPwd(pwd)
  }

  return (
    <>
      <PageHeader 
        title="Créer un salon"
        breadcrumbs={[
          { label: "Dashboard", href: "/" },
          { label: "Salons", href: "/salons" },
          { label: "Créer", isCurrent: true }
        ]}
      />

      <div className="w-full mx-2 flex flex-col md:flex-row gap-8">
        {/* Main Form */}
        <div className="flex-1 w-2/3 bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold mb-2 text-gray-800">Informations du salon</h2>
          <p className="mb-6 text-gray-500">Remplissez les champs ci-dessous pour enregistrer un nouveau salon.</p>
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
                    rules={{ required: "Latitude requise",  min : 0 }}
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
              <div className="w-full">
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
              <div className="w-full">
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
                            }
                            field.onChange(newHours)
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
                            }
                            field.onChange(newHours)
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
              <Button type="submit" className="w-full md:w-auto px-8 py-2 text-base font-semibold">
                Créer le salon
              </Button>
            </div>
          </form>
        </div>

        {/* Card security */}
        <div className="w-1/3 flex-shrink-0">
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <h3 className="text-xl font-bold mb-4 text-gray-800 flex items-center gap-2">
              <span role="img" aria-label="lock">🔒</span> Sécurité du compte
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block font-medium mb-1">Nom du gérant *</label>
                <Controller
                  name="ownerName"
                  control={control}
                  rules={{ required: "Nom du gérant requis" }}
                  render={({ field }) => (
                    <Input {...field} placeholder="Ex: Jean Dupont" />
                  )}
                />
                {errors.ownerName && <span className="text-red-500 text-xs">{errors.ownerName.message}</span>}
              </div>
              <div>
                <label className="block font-medium mb-1">Téléphone du gérant *</label>
                <Controller
                  name="ownerPhone"
                  control={control}
                  rules={{ required: "Téléphone du gérant requis" }}
                  render={({ field }) => (
                    <Input {...field} placeholder="Ex: +237 6 99 88 77 66" />
                  )}
                />
                {errors.ownerPhone && <span className="text-red-500 text-xs">{errors.ownerPhone.message}</span>}
              </div>
              <div>
                <label className="block font-medium mb-1">Email du gérant *</label>
                <Controller
                  name="ownerEmail"
                  control={control}
                  rules={{
                    required: "Email du gérant requis",
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: "Email invalide"
                    }
                  }}
                  render={({ field }) => (
                    <Input {...field} type="email" placeholder="Ex: gerant@salon.com" />
                  )}
                />
                {errors.ownerEmail && <span className="text-red-500 text-xs">{errors.ownerEmail.message}</span>}
              </div>
              <div>
                <label className="block font-medium mb-1">Mot de passe *</label>
                <div className="flex gap-2">
                  <Controller
                    name="password"
                    control={control}
                    rules={{ required: "Mot de passe requis", minLength: { value: 8, message: "8 caractères minimum" } }}
                    render={({ field }) => (
                      <Input {...field} type="text" placeholder="Générez ou saisissez un mot de passe" />
                    )}
                  />
                  <Button type="button" variant="outline" onClick={handleGeneratePassword}>
                    Générer
                  </Button>
                </div>
                {errors.password && <span className="text-red-500 text-xs">{errors.password.message}</span>}
              </div>
              <div>
                <label className="block font-medium mb-1">Vérification du mot de passe *</label>
                <Controller
                  name="confirmPassword"
                  control={control}
                  rules={{
                    required: "Confirmation requise",
                    validate: (value) => value === watch("password") || "Les mots de passe ne correspondent pas"
                  }}
                  render={({ field }) => (
                    <Input {...field} type="text" placeholder="Confirmez le mot de passe" />
                  )}
                />
                {errors.confirmPassword && <span className="text-red-500 text-xs">{errors.confirmPassword.message}</span>}
              </div>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={showOwnerModal} onOpenChange={setShowOwnerModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Gérant déjà existant</DialogTitle>
            <DialogDescription>
              Ce gérant possède déjà un autre salon.<br />
              Voulez-vous quand même continuer et l’ajouter à ce salon ?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-4 justify-end">
            <DialogClose asChild>
              <Button variant="outline" onClick={() => setShowOwnerModal(false)}>
                Annuler
              </Button>
            </DialogClose>
            <Button onClick={handleContinueWithExistingOwner}>
              Continuer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
