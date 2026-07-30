import React from 'react'
import { IActivity } from '@zyra/core/types/notifications.types'
import { ActivityItem } from './ActivityItem'

interface ActivityFeedProps {
  activities: IActivity[]
  isLoading: boolean
}

function groupByDate(activities: IActivity[]): Array<{ dateLabel: string; items: IActivity[] }> {
  const groups: Record<string, IActivity[]> = {}
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  activities.forEach(a => {
    const date = a.createdAt?.toDate?.()
    if (!date) { groups['Anciens'] = [...(groups['Anciens'] ?? []), a]; return }

    const d = date
    const isToday = d.toDateString() === today.toDateString()
    const isYesterday = d.toDateString() === yesterday.toDateString()

    const key = isToday
      ? "Aujourd'hui"
      : isYesterday
        ? 'Hier'
        : d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })

    groups[key] = [...(groups[key] ?? []), a]
  })

  return Object.entries(groups).map(([dateLabel, items]) => ({ dateLabel, items }))
}

export function ActivityFeed({ activities, isLoading }: ActivityFeedProps) {
  if (isLoading) {
    return (
      <div className="space-y-1 p-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex items-start gap-3 px-4 py-3">
            <div className="w-7 h-7 rounded-xl bg-slate-200 dark:bg-slate-700/60 animate-pulse flex-shrink-0" />
            <div className="flex-1 space-y-1.5">
              <div className="h-3.5 bg-slate-200 dark:bg-slate-700/60 rounded-lg animate-pulse w-3/4" />
              <div className="h-3 bg-slate-200 dark:bg-slate-700/60 rounded-lg animate-pulse w-1/4" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (activities.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-[#F5F2EF] dark:bg-slate-800 flex items-center justify-center text-slate-400 text-2xl">
          📋
        </div>
        <p className="text-[14px] font-semibold text-slate-700 dark:text-slate-300">Aucune activité</p>
        <p className="text-[12px] text-slate-400 dark:text-slate-500 max-w-xs">
          Les actions effectuées sur le salon apparaîtront ici.
        </p>
      </div>
    )
  }

  const groups = groupByDate(activities)

  return (
    <div className="divide-y divide-[#F0EAE4] dark:divide-slate-800/50">
      {groups.map(group => (
        <div key={group.dateLabel}>
          <div className="px-4 py-2 sticky top-0 bg-white/90 dark:bg-[#161B24]/90 backdrop-blur-sm z-10">
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-slate-400 dark:text-slate-500">
              {group.dateLabel}
            </span>
          </div>
          <div>
            {group.items.map(a => (
              <ActivityItem key={a.id} activity={a} />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
