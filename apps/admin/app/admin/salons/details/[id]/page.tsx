'use client'
import * as React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import { where } from "firebase/firestore"
import { toast } from "sonner"
import { fetchCollection, fetchCollectionPaginate } from "@zyra/conf/lib/query"
import { ISalon, ISalonService } from "@zyra/conf/domain/entities/salons.entities"
import { IOwner } from "@zyra/conf/domain/entities/owners.entities"
import { IHairDresser } from "@zyra/conf/domain/entities/hairdressers.entities"
import { SalonStatusEnum } from "@zyra/conf/domain/enums/statusEnum"
import PageHeader from "@/presentation/components/common/PageHeader"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@zyra/ui/components/tabs"
import { Button } from "@zyra/ui/components/button"
import ReservationsDetails from "@/presentation/components/salons/details/ReservationsDetails"
import TimeSlotsDetails from "@/presentation/components/salons/details/TimeSlots/TimeSlotsDetails"
import ServiceDetails from "@/presentation/components/salons/details/Services/ServiceDetails"
import HairDressers from "@/presentation/components/salons/details/HairDressers"
import Pagination from "@/presentation/components/common/Pagination"
import ServiceCategoriesDetails from "@/presentation/components/salons/details/ServiceCategoriesDetails"
import {
  Calendar, Users, Scissors, MapPin, Phone, Mail, Clock,
  Trash2, Ban, ExternalLink, Images, Star, ChevronRight, Zap, RefreshCw
} from "lucide-react"
import { useSalonSubscription, upsertSalonSubscription } from "@/usecases/subscriptionUseCases"
import { IPackage } from "@zyra/conf/domain/entities/package.entities"
import AssignPlanModal from "@/presentation/components/salons/AssignPlanModal"
import { SubscriptionStatus } from "@zyra/conf/domain/entities/subscriptions.entities"
import { useQueryClient } from "@tanstack/react-query"

const PAGE_SIZE = 5
const FALLBACK_IMG = "https://media.istockphoto.com/id/1405447809/fr/vectoriel/ciseaux-et-peigne-avec-motif-et-cadre-design-pour-coiffeur-et-salon-de-beaut%C3%A9.jpg?s=612x612&w=0&k=20&c=e_I7ZqWyNOa848dmxk7LMNgaDtq_GRqEz3nuy2-cwnc="

// ── Status config ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status?: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    [SalonStatusEnum.active]: { label: "Actif", cls: "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/50" },
    [SalonStatusEnum.suspended]: { label: "Suspendu", cls: "bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800/50" },
    [SalonStatusEnum.payment]: { label: "Paiement", cls: "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800/50" },
    [SalonStatusEnum.deleted]: { label: "Supprimé", cls: "bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700" },
  }
  const cfg = map[status ?? ""] ?? { label: status ?? "—", cls: "bg-slate-100 text-slate-500 border-slate-200" }
  return (
    <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full border ${cfg.cls}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {cfg.label}
    </span>
  )
}

// ── KPI card ──────────────────────────────────────────────────────────────────

function KpiCard({ icon, label, value, bg, iconColor }: {
  icon: React.ReactNode; label: string; value: React.ReactNode; bg: string; iconColor: string
}) {
  return (
    <div className={`${bg} rounded-2xl p-4 flex items-center gap-4`}>
      <div className={`w-10 h-10 rounded-xl bg-white/70 dark:bg-black/20 flex items-center justify-center ${iconColor} flex-shrink-0`}>
        {icon}
      </div>
      <div>
        <p className="text-[22px] font-extrabold text-slate-800 dark:text-white leading-none">{value}</p>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">{label}</p>
      </div>
    </div>
  )
}

// ── Photo gallery strip ───────────────────────────────────────────────────────

function PhotoStrip({ photos }: { photos: string[] }) {
  const [lightbox, setLightbox] = useState<string | null>(null)
  if (!photos.length) return null
  return (
    <>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {photos.map((src, i) => (
          <button key={i} onClick={() => setLightbox(src)}
            className="relative flex-shrink-0 w-24 h-24 rounded-xl overflow-hidden border-2 border-[#F0EAE4] dark:border-slate-700 hover:border-emerald-400 transition-colors group"
          >
            <img src={src} alt="" className="w-full h-full object-cover" />
            {i === 0 && (
              <span className="absolute bottom-1 left-1 text-[9px] font-bold bg-emerald-500 text-white px-1 py-0.5 rounded">Cover</span>
            )}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
              <ExternalLink className="w-4 h-4 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </button>
        ))}
      </div>
      {lightbox && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onClick={() => setLightbox(null)}>
          <img src={lightbox} alt="" className="max-w-full max-h-full rounded-2xl object-contain" />
        </div>
      )}
    </>
  )
}

// ── Opening hours mini-view ───────────────────────────────────────────────────

const DAY_LABELS: Record<string, string> = {
  monday: "Lun", tuesday: "Mar", wednesday: "Mer", thursday: "Jeu",
  friday: "Ven", saturday: "Sam", sunday: "Dim"
}

function OpeningHoursGrid({ hours }: { hours: any[] }) {
  if (!hours?.length) return <p className="text-[12px] text-slate-400">Non configuré</p>
  return (
    <div className="grid grid-cols-7 gap-1">
      {hours.map((h: any) => (
        <div key={h.day} className="text-center">
          <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 mb-1">
            {DAY_LABELS[h.day] ?? h.day}
          </p>
          {h.isOpen ? (
            <div className="text-[9px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 rounded-lg py-1 px-0.5 leading-tight">
              {h.openTime}<br/>{h.closeTime}
            </div>
          ) : (
            <div className="text-[9px] text-slate-300 dark:text-slate-600 bg-slate-50 dark:bg-slate-800/50 rounded-lg py-2">F</div>
          )}
        </div>
      ))}
    </div>
  )
}

// ── Info row ──────────────────────────────────────────────────────────────────

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value?: string }) {
  if (!value) return null
  return (
    <div className="flex items-start gap-2.5">
      <div className="w-7 h-7 rounded-lg bg-[#F5F2EF] dark:bg-slate-700/50 flex items-center justify-center text-slate-500 flex-shrink-0 mt-0.5">
        {icon}
      </div>
      <div>
        <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium uppercase tracking-wide">{label}</p>
        <p className="text-[13px] text-slate-700 dark:text-slate-300 font-medium">{value}</p>
      </div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function SalonDetails({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const { id } = React.use(params)
  const [owner, setOwner] = useState<IOwner | null>(null)
  const [page, setPage] = useState(1)
  const [activeTab, setActiveTab] = useState("reservations")

  const { data: salon, isLoading } = useQuery({
    queryKey: ['fetch-salon-details', id],
    enabled: !!id,
    queryFn: async () => {
      const salons = await fetchCollection("salons", [where("id", "==", id)]) as ISalon[]
      if (!salons.length) { toast.error("Salon introuvable"); router.replace("/admin/salons"); return null }
      const s = salons[0]
      if (s?.ownerId) {
        const owners = await fetchCollection("owners", [where("id", "==", s.ownerId)]) as IOwner[]
        setOwner(owners[0] || null)
      }
      return s
    },
  })

  const { data: hairdressersData = { data: [], total: 0 } } = useQuery({
    queryKey: ['hairdressers-by-salon', id, page],
    enabled: !!id,
    queryFn: async () => {
      const [active, inactive] = await Promise.all([
        fetchCollectionPaginate("hair_dressers", { page, pageSize: PAGE_SIZE, constraints: [where("salonIds", "array-contains", { salonId: id, active: true })] }),
        fetchCollectionPaginate("hair_dressers", { page, pageSize: PAGE_SIZE, constraints: [where("salonIds", "array-contains", { salonId: id, active: false })] }),
      ])
      return { data: [...(active.data || []), ...(inactive.data || [])], total: (active.total || 0) + (inactive.total || 0) }
    },
  })

  const queryClient = useQueryClient()
  const [showPlanModal, setShowPlanModal] = useState(false)
  const [planSubmitting, setPlanSubmitting] = useState(false)

  const { data: subscription } = useSalonSubscription(id)

  const handleAssignPlan = async (pkg: IPackage, endDate: Date) => {
    setPlanSubmitting(true)
    try {
      await upsertSalonSubscription({
        salonId: id,
        salonName: salon?.name,
        pkg,
        endDate,
        currentSalonStatus: salon?.status?.name,
      })
      queryClient.invalidateQueries({ queryKey: ['salon-subscription', id] })
      queryClient.invalidateQueries({ queryKey: ['fetch-salon-details', id] })
      toast.success(
        salon?.status?.name === 'payment'
          ? "Forfait assigné — salon passé en Actif"
          : "Forfait mis à jour avec succès"
      )
      setShowPlanModal(false)
    } catch {
      toast.error("Erreur lors de la mise à jour du forfait")
    } finally {
      setPlanSubmitting(false)
    }
  }

  const { data: categories = [] } = useQuery({
    queryKey: ['salon-categories'],
    queryFn: () => fetchCollection('salon_categories'),
  })

  const hairdressers = hairdressersData.data as IHairDresser[]
  const totalHairdressers = hairdressersData.total
  const categoryLabel = (categories as any[]).find(c => c.id === salon?.category)?.name ?? salon?.category
  const services: ISalonService[] = salon?.services || []
  const photos: string[] = (salon?.photos as any as string[]) || []
  const coverPhoto = photos[0] || FALLBACK_IMG
  const openingHours = salon?.openingHours || []
  const reservationsList: any[] = []

  const card = "bg-white dark:bg-[#161B24] border border-[#F0EAE4] dark:border-slate-800/50 rounded-2xl"

  if (isLoading || !salon) {
    return (
      <>
        <PageHeader title="Détails du salon" breadcrumbs={[
          { label: "Dashboard", href: "/admin" }, { label: "Salons", href: "/admin/salons" },
          { label: "Chargement…", isCurrent: true }
        ]} />
        <div className="flex items-center justify-center h-48">
          <div className="w-8 h-8 border-4 border-emerald-400 border-t-transparent rounded-full animate-spin" />
        </div>
      </>
    )
  }

  return (
    <>
      <PageHeader
        title={salon.name}
        breadcrumbs={[
          { label: "Dashboard", href: "/admin" },
          { label: "Salons", href: "/admin/salons" },
          { label: salon.name, isCurrent: true }
        ]}
      />

      <div className="space-y-5">

        {/* ── Hero card ── */}
        <div className={`${card} overflow-hidden`}>
          {/* Cover banner */}
          <div className="relative h-36 w-full overflow-hidden">
            <img src={coverPhoto} alt="" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
            <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
              <div className="flex items-end gap-3">
                <div className="w-14 h-14 rounded-2xl border-2 border-white overflow-hidden bg-white shadow-lg flex-shrink-0">
                  <img src={coverPhoto} alt="" className="w-full h-full object-cover" />
                </div>
                <div>
                  <h1 className="text-[20px] font-extrabold text-white leading-tight drop-shadow">{salon.name}</h1>
                  <div className="flex items-center gap-2 mt-0.5">
                    <StatusBadge status={salon.status?.name} />
                    {categoryLabel && (
                      <span className="text-[11px] font-semibold text-white/80 bg-white/20 px-2 py-0.5 rounded-full backdrop-blur-sm">
                        {categoryLabel}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              {/* Action buttons */}
              <div className="flex gap-2">
                <Button size="sm" variant="outline"
                  className="bg-white/10 border-white/30 text-white hover:bg-white/20 backdrop-blur-sm text-[12px] h-8">
                  <Ban className="w-3.5 h-3.5 mr-1.5" />
                  Suspendre
                </Button>
                <Button size="sm"
                  className="bg-rose-500 hover:bg-rose-600 text-white text-[12px] h-8 border-0">
                  <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                  Supprimer
                </Button>
              </div>
            </div>
          </div>

          {/* Info strip */}
          <div className="px-5 py-3 flex flex-wrap items-center gap-x-5 gap-y-1.5 border-t border-[#F0EAE4] dark:border-slate-800/50">
            {salon.city && (
              <span className="flex items-center gap-1.5 text-[12px] text-slate-500 dark:text-slate-400">
                <MapPin className="w-3.5 h-3.5 text-emerald-500" /> {salon.city}
              </span>
            )}
            {salon.phone && (
              <span className="flex items-center gap-1.5 text-[12px] text-slate-500 dark:text-slate-400">
                <Phone className="w-3.5 h-3.5 text-emerald-500" /> {salon.phone}
              </span>
            )}
            {salon.email && (
              <span className="flex items-center gap-1.5 text-[12px] text-slate-500 dark:text-slate-400">
                <Mail className="w-3.5 h-3.5 text-emerald-500" /> {salon.email}
              </span>
            )}
            {salon.address && (
              <span className="flex items-center gap-1.5 text-[12px] text-slate-500 dark:text-slate-400 flex-1 min-w-0 truncate">
                <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" /> {salon.address}
              </span>
            )}
          </div>
        </div>

        {/* ── KPI row ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <KpiCard
            icon={<Calendar className="w-5 h-5" />} label="Réservations"
            value={salon.reservationsCount ?? 0}
            bg="bg-[#EEF8F0] dark:bg-emerald-950/20" iconColor="text-emerald-600"
          />
          <KpiCard
            icon={<Users className="w-5 h-5" />} label="Coiffeurs"
            value={totalHairdressers}
            bg="bg-[#ECF6FE] dark:bg-sky-950/20" iconColor="text-sky-600"
          />
          <KpiCard
            icon={<Scissors className="w-5 h-5" />} label="Services"
            value={services.length}
            bg="bg-[#FEF1EC] dark:bg-rose-950/20" iconColor="text-rose-500"
          />
          <KpiCard
            icon={<Images className="w-5 h-5" />} label="Photos"
            value={photos.length}
            bg="bg-[#F2EDFE] dark:bg-violet-950/20" iconColor="text-violet-600"
          />
        </div>

        {/* ── Middle grid: salon info + owner + opening hours ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* Salon details */}
          <div className={`${card} p-5 lg:col-span-2 space-y-4`}>
            <h3 className="text-[13px] font-bold text-slate-800 dark:text-white">À propos</h3>
            {salon.description && (
              <p className="text-[13px] text-slate-500 dark:text-slate-400 leading-relaxed">{salon.description}</p>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <InfoRow icon={<MapPin className="w-3.5 h-3.5" />} label="Adresse" value={salon.address} />
              <InfoRow icon={<MapPin className="w-3.5 h-3.5" />} label="Ville" value={salon.city} />
              <InfoRow icon={<Phone className="w-3.5 h-3.5" />} label="Téléphone" value={salon.phone} />
              <InfoRow icon={<Mail className="w-3.5 h-3.5" />} label="Email" value={salon.email} />
            </div>

            {/* Photo gallery strip */}
            {photos.length > 0 && (
              <div className="pt-2 border-t border-[#F0EAE4] dark:border-slate-800/50">
                <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide mb-2">
                  Galerie · {photos.length} photo{photos.length > 1 ? 's' : ''}
                </p>
                <PhotoStrip photos={photos} />
              </div>
            )}
          </div>

          {/* Right: owner + hours */}
          <div className="space-y-4">
            {/* Owner */}
            <div className={`${card} p-5`}>
              <h3 className="text-[13px] font-bold text-slate-800 dark:text-white mb-4">Propriétaire</h3>
              {owner ? (
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center text-white font-bold text-[14px] flex-shrink-0">
                    {owner.name?.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 space-y-2">
                    <p className="text-[13px] font-semibold text-slate-800 dark:text-white">{owner.name}</p>
                    <div className="space-y-1.5">
                      <InfoRow icon={<Mail className="w-3.5 h-3.5" />} label="Email" value={owner.email} />
                      <InfoRow icon={<Phone className="w-3.5 h-3.5" />} label="Téléphone" value={owner.phone} />
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-[12px] text-slate-400">Aucun propriétaire associé</p>
              )}
            </div>

            {/* Opening hours */}
            <div className={`${card} p-5`}>
              <div className="flex items-center gap-2 mb-4">
                <Clock className="w-4 h-4 text-emerald-500" />
                <h3 className="text-[13px] font-bold text-slate-800 dark:text-white">Horaires d'ouverture</h3>
              </div>
              <OpeningHoursGrid hours={openingHours} />
            </div>

            {/* Forfait / subscription */}
            <div className={`${card} p-5`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-500" />
                  <h3 className="text-[13px] font-bold text-slate-800 dark:text-white">Forfait actuel</h3>
                </div>
                <button
                  onClick={() => setShowPlanModal(true)}
                  className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
                >
                  <RefreshCw className="w-3 h-3" />
                  {subscription ? 'Modifier' : 'Assigner'}
                </button>
              </div>

              {subscription ? (() => {
                const start = subscription.startDate?.toDate?.() ?? new Date()
                const end = subscription.endDate?.toDate?.() ?? new Date()
                const total = end.getTime() - start.getTime()
                const elapsed = Date.now() - start.getTime()
                const pct = Math.min(100, Math.max(0, Math.round((elapsed / total) * 100)))
                const daysLeft = Math.max(0, Math.ceil((end.getTime() - Date.now()) / 86_400_000))
                const isExpired = subscription.status === SubscriptionStatus.EXPIRED || end < new Date()
                return (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[14px] font-extrabold text-slate-800 dark:text-white">
                        {subscription.packageName}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        isExpired
                          ? 'bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-950/30 dark:text-rose-400 dark:border-rose-800/50'
                          : 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800/50'
                      }`}>
                        {isExpired ? 'Expiré' : 'Actif'}
                      </span>
                    </div>
                    <div className="text-[12px] text-slate-500 dark:text-slate-400 space-y-0.5">
                      <p>Du {start.toLocaleDateString('fr-FR')}</p>
                      <p>Au {end.toLocaleDateString('fr-FR')}</p>
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-[10px] text-slate-400">{pct}% écoulé</span>
                        <span className="text-[10px] font-semibold text-slate-600 dark:text-slate-300">
                          {daysLeft}j restants
                        </span>
                      </div>
                      <div className="h-1.5 rounded-full bg-[#F0EAE4] dark:bg-slate-700 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${isExpired ? 'bg-rose-400' : 'bg-emerald-500'}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                    <p className="text-[13px] font-bold text-slate-700 dark:text-slate-300">
                      {subscription.amount.toLocaleString('fr-FR')} {subscription.currency}
                    </p>
                  </div>
                )
              })() : (
                <div className="flex flex-col items-center justify-center py-4 gap-2">
                  <p className="text-[12px] text-slate-400">Aucun forfait assigné</p>
                  <button
                    onClick={() => setShowPlanModal(true)}
                    className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 underline"
                  >
                    Assigner un forfait
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Tabs section ── */}
        <div className={`${card} p-5`}>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="bg-[#F8F4F0] dark:bg-slate-800/50 rounded-xl p-1 mb-5 flex gap-0.5">
              {[
                { value: "reservations", label: "Réservations" },
                { value: "services", label: "Services" },
                { value: "categories", label: "Catégories" },
                { value: "horaires", label: "Horaires" },
                { value: "hairdressers", label: "Coiffeurs" },
              ].map(tab => (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className="text-[12px] font-semibold px-3 py-1.5 rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:text-emerald-700 dark:data-[state=active]:text-emerald-400 data-[state=active]:shadow-sm transition-all"
                >
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value="reservations">
              <ReservationsDetails reservationsList={reservationsList} />
            </TabsContent>

            <TabsContent value="services">
              <ServiceDetails services={services} salon={salon} />
            </TabsContent>

            <TabsContent value="categories">
              <ServiceCategoriesDetails salon={salon} />
            </TabsContent>

            <TabsContent value="horaires">
              <TimeSlotsDetails timeSlots={openingHours} salon={salon} />
            </TabsContent>

            <TabsContent value="hairdressers">
              <HairDressers salonId={id} hairdressers={hairdressers} salonName={salon.name} />
              <div className="mt-4">
                <Pagination page={page} pageSize={PAGE_SIZE} total={totalHairdressers} onPageChange={setPage} />
              </div>
            </TabsContent>
          </Tabs>
        </div>

      </div>

      <AssignPlanModal
        open={showPlanModal}
        onOpenChange={open => { if (!open && !planSubmitting) setShowPlanModal(false) }}
        onConfirm={handleAssignPlan}
        confirming={planSubmitting}
        title="Modifier le forfait"
      />
    </>
  )
}
