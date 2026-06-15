'use client'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose,
} from "@zyra/ui/components/dialog"
import { IHairDresser, HairDresserSalonAssociation } from '@zyra/conf/domain/entities/hairdressers.entities'
import { Mail, Phone, MapPin, Calendar, Star, X } from "lucide-react"

const DAY_LABELS: Record<string, string> = {
  monday: "Lun", tuesday: "Mar", wednesday: "Mer", thursday: "Jeu",
  friday: "Ven", saturday: "Sam", sunday: "Dim"
}

function StatBox({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className={`${color} rounded-xl p-3 text-center flex-1`}>
      <p className="text-[20px] font-extrabold text-slate-800 dark:text-white">{value}</p>
      <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">{label}</p>
    </div>
  )
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value?: string | null }) {
  if (!value) return null
  return (
    <div className="flex items-center gap-2.5">
      <div className="w-7 h-7 rounded-lg bg-[#F5F2EF] dark:bg-slate-700/50 flex items-center justify-center text-slate-400 flex-shrink-0">
        {icon}
      </div>
      <div>
        <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wide">{label}</p>
        <p className="text-[13px] text-slate-700 dark:text-slate-300 font-medium">{value}</p>
      </div>
    </div>
  )
}

export default function ViewHairDresserModal({
  open, onClose, hairDresser, salonName, association, countryName: _countryName,
}: {
  open: boolean
  onClose: () => void
  hairDresser: IHairDresser | null
  salonName?: string
  association?: HairDresserSalonAssociation | null
  countryName?: string
}) {
  if (!hairDresser) return null

  const workingDays = association?.workingHours?.filter((h: any) => h.openDay) ?? []
  const isActive = association ? association.active : hairDresser.status === 'active'

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-lg p-0 overflow-hidden dark:bg-[#161B24] border border-[#F0EAE4] dark:border-slate-800/50 rounded-2xl gap-0">
        <DialogTitle className="sr-only">Détails du coiffeur</DialogTitle>

        {/* Header */}
        <div className="relative bg-gradient-to-br from-emerald-50 to-[#F8F4F0] dark:from-emerald-950/30 dark:to-[#161B24] px-6 pt-6 pb-5">
          <DialogClose className="absolute top-4 right-4 w-7 h-7 rounded-full bg-white/80 dark:bg-slate-700/80 flex items-center justify-center text-slate-500 hover:text-slate-700 transition-colors">
            <X className="w-3.5 h-3.5" />
          </DialogClose>

          <div className="flex items-center gap-4">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              {hairDresser.photo ? (
                <img src={hairDresser.photo} alt={hairDresser.name}
                  className="w-16 h-16 rounded-2xl object-cover border-2 border-white shadow-md"
                />
              ) : (
                <div className="w-16 h-16 rounded-2xl bg-emerald-500 flex items-center justify-center text-white font-bold text-[22px] shadow-md">
                  {hairDresser.name?.charAt(0).toUpperCase()}
                </div>
              )}
              <span className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${isActive ? 'bg-emerald-500' : 'bg-rose-400'}`} />
            </div>

            <div>
              <h2 className="text-[16px] font-extrabold text-slate-800 dark:text-white">{hairDresser.name}</h2>
              {hairDresser.speciality && (
                <p className="text-[12px] text-slate-500 dark:text-slate-400 mt-0.5">{hairDresser.speciality}</p>
              )}
              <div className="flex items-center gap-2 mt-1.5">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                  isActive
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/50'
                    : 'bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800/50'
                }`}>
                  {isActive ? 'Actif' : 'Inactif'}
                </span>
                {association?.contractType && (
                  <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 bg-white/60 dark:bg-slate-700/50 px-2 py-0.5 rounded-full capitalize">
                    {association.contractType}
                    {association.contractType === 'commission' && association.commissionRate
                      ? ` · ${association.commissionRate}%`
                      : ''}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-5">

          {/* Stats */}
          <div className="flex gap-2">
            <StatBox label="Prises" value={hairDresser.reservationsTaken ?? 0} color="bg-[#ECF6FE] dark:bg-sky-950/20" />
            <StatBox label="Confirmées" value={hairDresser.reservationsConfirmed ?? 0} color="bg-[#EEF8F0] dark:bg-emerald-950/20" />
            <StatBox label="Réalisées" value={hairDresser.reservationsDone ?? 0} color="bg-[#F2EDFE] dark:bg-violet-950/20" />
          </div>

          {/* Contact */}
          <div className="space-y-2.5">
            <InfoRow icon={<Mail className="w-3.5 h-3.5" />} label="Email" value={hairDresser.email} />
            <InfoRow icon={<Phone className="w-3.5 h-3.5" />} label="Téléphone" value={hairDresser.phone} />
            <InfoRow icon={<MapPin className="w-3.5 h-3.5" />} label="Localisation"
              value={[hairDresser.city, hairDresser.country].filter(Boolean).join(', ')}
            />
            {salonName && (
              <InfoRow icon={<Star className="w-3.5 h-3.5" />} label="Salon" value={salonName} />
            )}
            {hairDresser.createdAt && (
              <InfoRow icon={<Calendar className="w-3.5 h-3.5" />} label="Membre depuis"
                value={new Date(hairDresser.createdAt).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}
              />
            )}
          </div>

          {/* Working hours */}
          {workingDays.length > 0 && (
            <div className="border-t border-[#F0EAE4] dark:border-slate-800/50 pt-4">
              <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide mb-2.5">
                Horaires de travail
              </p>
              <div className="space-y-1.5">
                {workingDays.map((h: any) => (
                  <div key={h.day} className="flex items-center justify-between px-3 py-1.5 bg-[#F8F4F0] dark:bg-slate-800/40 rounded-lg">
                    <span className="text-[12px] font-semibold text-slate-600 dark:text-slate-300 w-8">
                      {DAY_LABELS[h.day] ?? h.day}
                    </span>
                    <span className="text-[12px] text-emerald-600 dark:text-emerald-400 font-medium">
                      {h.open} – {h.close}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
