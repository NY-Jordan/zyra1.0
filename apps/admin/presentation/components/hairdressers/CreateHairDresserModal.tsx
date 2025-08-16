'use client'
import React, { useState, useEffect } from "react"
import { useForm, Controller } from "react-hook-form"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@zyra/ui/components/dialog"
import { Input } from "@zyra/ui/components/input"
import { Button } from "@zyra/ui/components/button"
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query"
import { createDocument, fetchCollection } from "@zyra/conf/lib/query"
import { uploadLogoFile } from "@zyra/conf/lib/utils"

type HairDresserForm = {
  photo: FileList
  name: string
  speciality: string
  email: string
  phone: string
  country: string
  city: string
  salonIds: string[] // toujours présent mais non utilisé dans le formulaire
}

export default function CreateHairDresserModal({ open, onClose, loading = false }: {
  open: boolean,
  onClose: () => void,
  loading?: boolean
}) {
  const { control, handleSubmit, reset, watch, formState: { errors } } = useForm<HairDresserForm>({
    defaultValues: {
      salonIds: [], // initialisé à un array vide
    }
  })
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const queryClient = useQueryClient()

  // Fetch countries for select
  const { data: countries = [] } = useQuery({
    queryKey: ['countries'],
    queryFn: async () => {
      const res = await fetchCollection('countries')
      return res.filter((c: any) => c.active !== false)
    },
  })

  // Watch for photo changes to show preview
  const photoFile = watch("photo")
  useEffect(() => {
    if (photoFile && photoFile.length > 0) {
      const file = photoFile[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = (ev) => setPhotoPreview(ev.target?.result as string)
        reader.readAsDataURL(file)
      } else {
        setPhotoPreview(null)
      }
    } else {
      setPhotoPreview(null)
    }
  }, [photoFile])

  const { mutate, isPending } = useMutation({
    mutationFn: async (data: HairDresserForm) => {
      const file = data.photo?.[0]
      const url = file ? await uploadLogoFile("salons", file) : null
      const payload = {
        name: data.name,
        speciality: data.speciality,
        email: data.email,
        phone: data.phone,
        country: data.country,
        city: data.city,
        salonIds: [], // toujours array vide à la création
        reservationsTaken: 0,
        reservationsConfirmed: 0,
        reservationsDone: 0,
        createdAt: new Date().toISOString(),
        status: "active",
        photo: url
      }
      await createDocument("hair_dressers", payload)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hair-dressers'] })
      reset({ salonIds: [] })
      setPhotoPreview(null)
      onClose()
    }
  })

  const onSubmit = (data: HairDresserForm) => {
    mutate(data)
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Ajouter un coiffeur</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block font-medium mb-1">Photo</label>
            <Controller
              name="photo"
              control={control}
              render={({ field }) => (
                <>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      field.onChange(e.target.files as any)
                    }}
                  />
                  {photoPreview && (
                    <img src={photoPreview} alt="Aperçu" className="mt-2 w-20 h-20 object-cover rounded-full border" />
                  )}
                </>
              )}
            />
          </div>
          <div>
            <label className="block font-medium mb-1">Nom *</label>
            <Controller
              name="name"
              control={control}
              rules={{ required: "Le nom est requis" }}
              render={({ field }) => (
                <Input {...field} required />
              )}
            />
            {errors.name && <span className="text-red-500 text-xs">{errors.name.message}</span>}
          </div>
          <div>
            <label className="block font-medium mb-1">Spécialité *</label>
            <Controller
              name="speciality"
              control={control}
              rules={{ required: "La spécialité est requise" }}
              render={({ field }) => (
                <Input {...field} required />
              )}
            />
            {errors.speciality && <span className="text-red-500 text-xs">{errors.speciality.message}</span>}
          </div>
          <div>
            <label className="block font-medium mb-1">Email *</label>
            <Controller
              name="email"
              control={control}
              rules={{ required: "L'email est requis" }}
              render={({ field }) => (
                <Input type="email" {...field} required />
              )}
            />
            {errors.email && <span className="text-red-500 text-xs">{errors.email.message}</span>}
          </div>
          <div>
            <label className="block font-medium mb-1">Téléphone *</label>
            <Controller
              name="phone"
              control={control}
              rules={{ required: "Le téléphone est requis" }}
              render={({ field }) => (
                <Input {...field} required />
              )}
            />
            {errors.phone && <span className="text-red-500 text-xs">{errors.phone.message}</span>}
          </div>
          <div>
            <label className="block font-medium mb-1">Pays *</label>
            <Controller
              name="country"
              control={control}
              rules={{ required: "Le pays est requis" }}
              render={({ field }) => (
                <select {...field} className="w-full border rounded px-3 py-2" required>
                  <option value="">Sélectionnez un pays</option>
                  {countries.map((country: any) => (
                    <option key={country.id} value={country.id}>{country.name}</option>
                  ))}
                </select>
              )}
            />
            {errors.country && <span className="text-red-500 text-xs">{errors.country.message}</span>}
          </div>
          <div>
            <label className="block font-medium mb-1">Ville *</label>
            <Controller
              name="city"
              control={control}
              rules={{ required: "La ville est requise" }}
              render={({ field }) => (
                <Input {...field} required />
              )}
            />
            {errors.city && <span className="text-red-500 text-xs">{errors.city.message}</span>}
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">Annuler</Button>
            </DialogClose>
            <Button type="submit" disabled={loading || isPending}>
              {isPending ? "Ajout..." : "Ajouter"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}