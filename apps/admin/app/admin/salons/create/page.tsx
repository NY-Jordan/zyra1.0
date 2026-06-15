'use client'
import React, { useState, useRef, useEffect } from "react"
import { useForm, Controller, SubmitHandler } from "react-hook-form"
import { Button } from "@zyra/ui/components/button"
import { Input } from "@zyra/ui/components/input"
import PageHeader from "@/presentation/components/common/PageHeader"
import { ISalonFormValues } from "@zyra/conf/domain/entities/salons.entities"
import { createSalon } from "@/services/SalonServices"
import { checkOwnerExists, createOwner, getOwnerByEmail } from "@/services/OwnerService"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogDescription, DialogFooter, DialogClose,
} from "@zyra/ui/components/dialog"
import { generatePassword } from "@zyra/conf/lib/utils"
import { toast } from "sonner"
import { Routes } from "@zyra/conf/lib/route"
import { useRouter } from "next/navigation"
import { fetchCollection } from "@zyra/conf/lib/query"
import { where } from "firebase/firestore"
import { useQueryClient, useQuery } from "@tanstack/react-query"
import { defaultOpeningHours } from "@zyra/conf/lib/config"
import { ImagePlus, X, Shield, RefreshCw, Mail } from "lucide-react"
import AssignPlanModal from "@/presentation/components/salons/AssignPlanModal"
import { upsertSalonSubscription } from "@/usecases/subscriptionUseCases"
import { IPackage } from "@zyra/conf/domain/entities/package.entities"

// ── Gallery upload ────────────────────────────────────────────────────────────

function GalleryUploader({
  value,
  onChange,
}: {
  value: (File | null)[]
  onChange: (files: (File | null)[]) => void
}) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  const handleFile = (idx: number, file: File | null) => {
    const next = [...value]
    next[idx] = file
    onChange(next)
  }

  return (
    <div>
      <div className="grid grid-cols-3 gap-3">
        {Array.from({ length: 6 }).map((_, i) => {
          const file = value[i] ?? null
          const preview = file ? URL.createObjectURL(file) : null
          return (
            <div
              key={i}
              className="relative aspect-square rounded-xl overflow-hidden border-2 border-dashed border-[#E8E0D8] dark:border-slate-700 bg-[#FAF7F4] dark:bg-slate-800/50 hover:border-emerald-300 dark:hover:border-emerald-700 transition-colors group"
            >
              {preview ? (
                <>
                  <img src={preview} alt="" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => handleFile(i, null)}
                    className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/60 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3" />
                  </button>
                  {i === 0 && (
                    <span className="absolute bottom-1.5 left-1.5 text-[10px] font-bold bg-emerald-500 text-white px-1.5 py-0.5 rounded-md">
                      Cover
                    </span>
                  )}
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => inputRefs.current[i]?.click()}
                  className="w-full h-full flex flex-col items-center justify-center gap-1.5 text-slate-400 dark:text-slate-500 hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors"
                >
                  <ImagePlus className="w-5 h-5" />
                  <span className="text-[10px] font-medium">
                    {i === 0 ? 'Cover' : `Photo ${i + 1}`}
                  </span>
                </button>
              )}
              <input
                ref={el => { inputRefs.current[i] = el }}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={e => handleFile(i, e.target.files?.[0] ?? null)}
              />
            </div>
          )
        })}
      </div>
      <p className="mt-2 text-[11px] text-slate-400 dark:text-slate-500">
        Minimum 4 photos · Maximum 6 · La première photo sera utilisée comme couverture
      </p>
    </div>
  )
}

// ── Field wrapper ─────────────────────────────────────────────────────────────

function Field({ label, required, children, error }: {
  label: string; required?: boolean; children: React.ReactNode; error?: string
}) {
  return (
    <div>
      <label className="block text-[12px] font-semibold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wide">
        {label} {required && <span className="text-rose-500">*</span>}
      </label>
      {children}
      {error && <p className="mt-1 text-[11px] text-rose-500">{error}</p>}
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function CreateSalon() {
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [galleryFiles, setGalleryFiles] = useState<(File | null)[]>(Array(6).fill(null))
  const [generatedPwd, setGeneratedPwd] = useState("")
  const [includeMail, setIncludeMail] = useState(false)
  const [showOwnerModal, setShowOwnerModal] = useState(false)
  const [showPlanModal, setShowPlanModal] = useState(false)
  const [pendingSalonData, setPendingSalonData] = useState<any>(null)
  const [pendingOwnerData, setPendingOwnerData] = useState<any>(null)
  const [pendingOwnerExists, setPendingOwnerExists] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [ownerEmailExists, setOwnerEmailExists] = useState<boolean | null>(null)
  const [ownerEmailChecking, setOwnerEmailChecking] = useState(false)
  const router = useRouter()
  const queryClient = useQueryClient()

  const { control, handleSubmit, setValue, watch, formState: { errors } } = useForm<ISalonFormValues>()

  const ownerEmail = watch("ownerEmail")
  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  useEffect(() => {
    if (!ownerEmail || !EMAIL_RE.test(ownerEmail)) {
      setOwnerEmailExists(null)
      return
    }
    setOwnerEmailChecking(true)
    const t = setTimeout(async () => {
      try {
        const exists = await checkOwnerExists(ownerEmail)
        setOwnerEmailExists(exists)
      } finally {
        setOwnerEmailChecking(false)
      }
    }, 600)
    return () => clearTimeout(t)
  }, [ownerEmail])

  const { data: categories = [], isLoading: loadingCategories } = useQuery({
    queryKey: ['salon-categories'],
    queryFn: async () => {
      const res = await fetchCollection('salon_categories', [where("active", "==", true)])
      return res.filter((c: any) => c.active !== false)
    },
  })

  const { data: countries = [], isLoading: loadingCountries } = useQuery({
    queryKey: ['countries'],
    queryFn: async () => {
      const res = await fetchCollection('countries', [where("active", "==", true)])
      return res.filter((c: any) => c.active !== false)
    },
  })

  // Step 2: create salon + subscription (called from plan modal)
  const doCreate = async (pkg: IPackage, endDate: Date) => {
    setSubmitting(true)
    try {
      const photos = galleryFiles.filter(Boolean) as File[]

      const ownerId = pendingOwnerExists
        ? await getOwnerByEmail(pendingOwnerData.email)
        : await createOwner(pendingOwnerData)

      const salonId = await createSalon({
        salon: {
          ...pendingSalonData,
          openingHours: defaultOpeningHours,
          photos,
          logo: logoFile ?? undefined,
        },
        ownerId,
      })
      if (salonId) {
        await upsertSalonSubscription({
          salonId,
          salonName: pendingSalonData?.name,
          pkg,
          endDate,
        })
      }
      queryClient.invalidateQueries({ queryKey: ['salons'] })
      toast.success("Salon et forfait créés avec succès")
      router.push(Routes.protected.salons.url)
    } catch (e){
      console.log(e);
      toast.error("Erreur lors de la création du salon")
    } finally {
      setSubmitting(false)
      setShowPlanModal(false)
    }
  }

  // Step 1: validate form → check owner → open plan modal
  const onSubmit: SubmitHandler<ISalonFormValues> = async (data) => {
    const photos = galleryFiles.filter(Boolean) as File[]
    if (photos.length < 4) {
      toast.error("Veuillez ajouter au moins 4 photos pour la galerie")
      return
    }
    const { ownerName, ownerPhone, ownerEmail, password, confirmPassword, openingHours, ...salonData } = data
    const owner = { name: ownerName, phone: ownerPhone, email: ownerEmail, password, confirmPassword }

    const exists = await fetchCollection("salons", [where("name", "==", salonData.name)])
    if (exists.length > 0) { toast.error("Un salon avec ce nom existe déjà."); return }

    const ownerExists = ownerEmailExists ?? await checkOwnerExists(owner.email)
    setPendingSalonData(salonData)
    setPendingOwnerData(owner)
    setPendingOwnerExists(ownerExists)
    if (ownerExists) {
      setShowOwnerModal(true)
      return
    }
    setShowPlanModal(true)
  }

  const handleContinueWithExistingOwner = () => {
    setShowOwnerModal(false)
    setShowPlanModal(true)
  }

  const handleGeneratePassword = () => {
    const pwd = generatePassword()
    setValue("password", pwd)
    setValue("confirmPassword", pwd)
    setGeneratedPwd(pwd)
  }

  const card = "bg-white dark:bg-[#161B24] border border-[#F0EAE4] dark:border-slate-800/50 rounded-2xl p-6"

  return (
    <>
      <PageHeader
        title="Créer un salon"
        breadcrumbs={[
          { label: "Dashboard", href: "/admin" },
          { label: "Salons", href: "/admin/salons" },
          { label: "Créer", isCurrent: true }
        ]}
      />

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* ── Left: Salon info (2/3) ── */}
          <div className="lg:col-span-2 space-y-5">

            {/* Basic info */}
            <div className={card}>
              <h2 className="text-[15px] font-bold text-slate-800 dark:text-white mb-5">
                Informations du salon
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Nom" required error={errors.name?.message}>
                  <Controller name="name" control={control} rules={{ required: "Nom requis" }}
                    render={({ field }) => <Input {...field} placeholder="Ex: Salon Prestige" />}
                  />
                </Field>
                <Field label="Téléphone" required error={errors.phone?.message}>
                  <Controller name="phone" control={control} rules={{ required: "Numéro requis" }}
                    render={({ field }) => <Input {...field} placeholder="+237 6 99 99 99 99" />}
                  />
                </Field>
                <Field label="Adresse" required error={errors.address?.message}>
                  <Controller name="address" control={control} rules={{ required: "Adresse requise" }}
                    render={({ field }) => <Input {...field} placeholder="123 Rue de la Beauté, Bonapriso" />}
                  />
                </Field>
                <Field label="Ville" required error={errors.city?.message}>
                  <Controller name="city" control={control} rules={{ required: "Ville requise" }}
                    render={({ field }) => <Input {...field} placeholder="Douala" />}
                  />
                </Field>
                <Field label="Email professionnel" error={errors.email?.message}>
                  <Controller name="email" control={control}
                    render={({ field }) => <Input {...field} type="email" placeholder="contact@salon.com" />}
                  />
                </Field>
                <Field label="Coordonnées GPS" error={errors.location_lat?.message || errors.location_lng?.message}>
                  <div className="flex gap-2">
                    <Controller name="location_lat" control={control} rules={{ required: "Lat requise" }}
                      render={({ field }) => <Input {...field} type="number" step="any" placeholder="Latitude" />}
                    />
                    <Controller name="location_lng" control={control} rules={{ required: "Lng requise" }}
                      render={({ field }) => <Input {...field} type="number" step="any" placeholder="Longitude" />}
                    />
                  </div>
                </Field>
                <Field label="Catégorie" required error={errors.category?.message}>
                  <Controller name="category" control={control} rules={{ required: "Catégorie requise" }}
                    render={({ field }) => (
                      <select {...field} disabled={loadingCategories}
                        className="w-full h-10 border border-input rounded-md px-3 py-2 text-sm bg-background dark:bg-slate-800 dark:border-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                      >
                        <option value="">Sélectionnez une catégorie</option>
                        {categories.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                    )}
                  />
                </Field>
                <Field label="Pays" required error={errors.country?.message}>
                  <Controller name="country" control={control} rules={{ required: "Pays requis" }}
                    render={({ field }) => (
                      <select {...field} disabled={loadingCountries}
                        className="w-full h-10 border border-input rounded-md px-3 py-2 text-sm bg-background dark:bg-slate-800 dark:border-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                      >
                        <option value="">Sélectionnez un pays</option>
                        {countries.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                    )}
                  />
                </Field>
              </div>
              <div className="mt-4">
                <Field label="Description" required error={errors.description?.message}>
                  <Controller name="description" control={control} rules={{ required: "Description requise" }}
                    render={({ field }) => (
                      <textarea {...field} rows={3}
                        className="w-full border border-input rounded-md px-3 py-2 text-sm bg-background dark:bg-slate-800 dark:border-slate-700 dark:text-white resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                        placeholder="Décrivez le salon, ses spécialités, son ambiance…"
                      />
                    )}
                  />
                </Field>
              </div>
            </div>

            {/* Logo */}
            <div className={card}>
              <h2 className="text-[15px] font-bold text-slate-800 dark:text-white mb-4">Logo du salon</h2>
              <div className="flex items-center gap-5">
                <div className="w-20 h-20 rounded-2xl border-2 border-dashed border-[#E8E0D8] dark:border-slate-700 overflow-hidden flex-shrink-0 bg-[#F8F4F0] dark:bg-slate-800 flex items-center justify-center">
                  {logoPreview
                    ? <img src={logoPreview} alt="Logo" className="w-full h-full object-cover" />
                    : <ImagePlus className="w-7 h-7 text-slate-300 dark:text-slate-600" />
                  }
                </div>
                <div className="flex-1">
                  <p className="text-[12px] text-slate-500 dark:text-slate-400 mb-2">
                    Affiché dans la navbar de l'app salon. Format carré recommandé.
                  </p>
                  <div className="flex gap-2">
                    <label className="cursor-pointer inline-flex items-center gap-1.5 text-[12px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-3 py-1.5 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors">
                      <ImagePlus className="w-3.5 h-3.5" />
                      {logoFile ? 'Changer' : 'Choisir un logo'}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0] ?? null
                          setLogoFile(file)
                          setLogoPreview(file ? URL.createObjectURL(file) : null)
                        }}
                      />
                    </label>
                    {logoFile && (
                      <button
                        type="button"
                        onClick={() => { setLogoFile(null); setLogoPreview(null) }}
                        className="inline-flex items-center gap-1 text-[12px] text-slate-400 hover:text-rose-500 transition-colors"
                      >
                        <X className="w-3.5 h-3.5" /> Retirer
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Gallery */}
            <div className={card}>
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="text-[15px] font-bold text-slate-800 dark:text-white">Galerie photos</h2>
                  <p className="text-[12px] text-slate-400 dark:text-slate-500 mt-0.5">
                    {galleryFiles.filter(Boolean).length} / 6 photos sélectionnées
                  </p>
                </div>
                <span className="text-[11px] font-semibold text-rose-500 bg-rose-50 dark:bg-rose-950/30 px-2.5 py-1 rounded-full">
                  Min. 4 photos
                </span>
              </div>
              <GalleryUploader value={galleryFiles} onChange={setGalleryFiles} />
            </div>
          </div>

          {/* ── Right: Owner / security (1/3) ── */}
          <div className="space-y-5">
            <div className={card}>
              <div className="flex items-center gap-2 mb-5">
                <div className="w-8 h-8 rounded-xl bg-[#FEF1EC] dark:bg-rose-950/30 flex items-center justify-center">
                  <Shield className="w-4 h-4 text-rose-500" />
                </div>
                <h2 className="text-[15px] font-bold text-slate-800 dark:text-white">Compte gérant</h2>
              </div>
              <div className="space-y-4">
                <Field label="Nom du gérant" required error={errors.ownerName?.message}>
                  <Controller name="ownerName" control={control} rules={{ required: "Nom du gérant requis" }}
                    render={({ field }) => <Input {...field} placeholder="Jean Dupont" />}
                  />
                </Field>
                <Field label="Téléphone" required error={errors.ownerPhone?.message}>
                  <Controller name="ownerPhone" control={control} rules={{ required: "Téléphone requis" }}
                    render={({ field }) => <Input {...field} placeholder="+237 6 99 88 77 66" />}
                  />
                </Field>
                <Field label="Email" required error={errors.ownerEmail?.message}>
                  <div className="relative">
                    <Controller name="ownerEmail" control={control}
                      rules={{
                        required: "Email requis",
                        pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Email invalide" }
                      }}
                      render={({ field }) => <Input {...field} type="email" placeholder="gerant@salon.com" className="pr-8" />}
                    />
                    {ownerEmailChecking && (
                      <div className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 border-2 border-slate-300 border-t-emerald-500 rounded-full animate-spin" />
                    )}
                  </div>
                  {ownerEmailExists === true && (
                    <p className="mt-1.5 text-[11px] text-amber-600 dark:text-amber-400 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block" />
                      Gérant existant — aucun mot de passe requis
                    </p>
                  )}
                  {ownerEmailExists === false && (
                    <p className="mt-1.5 text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                      Nouveau gérant
                    </p>
                  )}
                </Field>

                {ownerEmailExists !== true && (
                  <>
                    <Field label="Mot de passe" required error={errors.password?.message}>
                      <div className="flex gap-2">
                        <Controller name="password" control={control}
                          rules={{ required: "Mot de passe requis", minLength: { value: 8, message: "8 car. min." } }}
                          render={({ field }) => <Input {...field} type="text" placeholder="Mot de passe" className="flex-1" />}
                        />
                        <Button type="button" variant="outline" size="sm" onClick={handleGeneratePassword} className="flex-shrink-0">
                          <RefreshCw className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                      {generatedPwd && (
                        <p className="mt-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-mono break-all">
                          {generatedPwd}
                        </p>
                      )}
                    </Field>
                    <Field label="Confirmer" required error={errors.confirmPassword?.message}>
                      <Controller name="confirmPassword" control={control}
                        rules={{
                          required: "Confirmation requise",
                          validate: v => v === watch("password") || "Les mots de passe ne correspondent pas"
                        }}
                        render={({ field }) => <Input {...field} type="text" placeholder="Confirmez le mot de passe" />}
                      />
                    </Field>
                  </>
                )}
              </div>

              {ownerEmailExists !== true && (
              <label className="flex items-center gap-2.5 cursor-pointer mt-1 pt-3 border-t border-[#F0EAE4] dark:border-slate-800/50">
                <div className="relative flex-shrink-0">
                  <input
                    type="checkbox"
                    checked={includeMail}
                    onChange={e => setIncludeMail(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-200 dark:bg-slate-700 rounded-full peer-checked:bg-emerald-500 transition-colors" />
                  <div className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform peer-checked:translate-x-4" />
                </div>
                <div>
                  <p className="text-[12px] font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    Inclure les accès dans le mail de bienvenue
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Envoie les identifiants au gérant après création</p>
                </div>
              </label>
              )}
            </div>

            {/* Submit */}
            <Button type="submit" disabled={submitting} className="w-full h-11 bg-[#0b0b14] hover:bg-slate-800 dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white rounded-xl text-[14px] font-semibold">
              {submitting ? "Création en cours…" : "Créer le salon →"}
            </Button>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 text-center">
              Un forfait sera requis à l'étape suivante.
            </p>
          </div>
        </div>
      </form>

      <AssignPlanModal
        open={showPlanModal}
        onOpenChange={open => { if (!open && !submitting) setShowPlanModal(false) }}
        onConfirm={doCreate}
        confirming={submitting}
      />

      <Dialog open={showOwnerModal} onOpenChange={setShowOwnerModal}>
        <DialogContent className="dark:bg-slate-900">
          <DialogHeader>
            <DialogTitle>Gérant déjà existant</DialogTitle>
            <DialogDescription>
              Ce gérant possède déjà un autre salon. Voulez-vous quand même continuer et l'associer à ce salon ?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-3 justify-end">
            <DialogClose asChild>
              <Button variant="outline" onClick={() => setShowOwnerModal(false)}>Annuler</Button>
            </DialogClose>
            <Button onClick={handleContinueWithExistingOwner} disabled={submitting}>
              {submitting ? "En cours…" : "Continuer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
