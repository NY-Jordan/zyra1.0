import React from 'react'
import { ResourceType } from '@zyra/core/types/notifications.types'
import { RESOURCE_TYPE_LABELS } from './activityConfig'

const RESOURCE_TABS: Array<ResourceType | 'all'> = [
  'all', 'reservation', 'order', 'client', 'hairdresser', 'service',
]

interface ActivityFiltersProps {
  activeResource: ResourceType | 'all'
  onResourceChange: (v: ResourceType | 'all') => void
}

export function ActivityFilters({ activeResource, onResourceChange }: ActivityFiltersProps) {
  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {RESOURCE_TABS.map(rt => (
        <button
          key={rt}
          type="button"
          onClick={() => onResourceChange(rt)}
          className={`h-8 px-3 rounded-xl text-[12px] font-bold transition-all ${
            activeResource === rt
              ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
              : 'bg-white dark:bg-[#161B24] border border-[#E8E0D8] dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-emerald-300 dark:hover:border-emerald-700'
          }`}
        >
          {RESOURCE_TYPE_LABELS[rt]}
        </button>
      ))}
    </div>
  )
}
