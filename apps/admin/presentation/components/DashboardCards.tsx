'use client'
import { Building2, Scissors, Calendar, Users } from "lucide-react"

const stats = [
  { icon: Building2, value: "235", label: "Salons actifs", color: "text-slate-700 dark:text-slate-300" },
  { icon: Scissors, value: "800", label: "Coiffeurs actifs", color: "text-slate-700 dark:text-slate-300" },
  { icon: Calendar, value: "123", label: "Réservations aujourd'hui", color: "text-slate-700 dark:text-slate-300" },
  { icon: Users, value: "1 500", label: "Clients inscrits", color: "text-slate-700 dark:text-slate-300" },
]

export default function DashboardCards() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {stats.map((stat) => {
        const Icon = stat.icon
        return (
          <div
            key={stat.value}
            className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl p-5"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium tracking-wide text-slate-400 dark:text-slate-500 uppercase">
                {stat.label}
              </span>
              <Icon className="h-4 w-4 text-slate-300 dark:text-slate-600" />
            </div>
            <p className="text-2xl font-semibold text-slate-800 dark:text-white tracking-tight">
              {stat.value}
            </p>
          </div>
        )
      })}
    </div>
  )
}
