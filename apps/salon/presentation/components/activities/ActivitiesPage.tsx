'use client'

import React, { useState } from 'react'
import { Activity, RefreshCw } from 'lucide-react'
import { useActivities } from '@/hooks/useActivities'
import { useSalon } from '@zyra/core/hooks/useSalon'
import { ResourceType } from '@zyra/core/types/notifications.types'
import { ActivityFeed } from './ActivityFeed'
import { ActivityFilters } from './ActivityFilters'

export default function ActivitiesPage() {
  const { salonId } = useSalon()
  const [resourceType, setResourceType] = useState<ResourceType | 'all'>('all')

  const { data: activities = [], isLoading, refetch, isFetching } = useActivities({
    salonId,
    resourceType,
  })

  return (
    <div className="space-y-5 pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-[22px] font-extrabold text-slate-800 dark:text-white tracking-tight">
            Activités
          </h1>
          <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5">
            Journal de toutes les actions effectuées sur ce salon
          </p>
        </div>

        <button
          type="button"
          onClick={() => refetch()}
          disabled={isFetching}
          className="self-start sm:self-auto flex items-center gap-2 h-9 px-4 rounded-xl bg-white dark:bg-[#161B24] border border-[#E8E0D8] dark:border-slate-700 text-[12px] font-bold text-slate-600 dark:text-slate-300 hover:border-emerald-300 dark:hover:border-emerald-700 transition-all disabled:opacity-50"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? 'animate-spin' : ''}`} />
          Actualiser
        </button>
      </div>

      {/* Filters */}
      <ActivityFilters activeResource={resourceType} onResourceChange={setResourceType} />

      {/* Feed card */}
      <div className="bg-white dark:bg-[#161B24] border border-[#F0EAE4] dark:border-slate-800/50 rounded-2xl overflow-hidden">
        {/* Card header */}
        <div className="flex items-center justify-between px-4 py-3.5 border-b border-[#F0EAE4] dark:border-slate-800/50">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-[#F5F2EF] dark:bg-slate-700/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <Activity className="h-3.5 w-3.5" />
            </div>
            <span className="text-[13px] font-extrabold text-slate-800 dark:text-white">
              Flux d'activités
            </span>
          </div>
          {!isLoading && (
            <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 bg-[#F5F2EF] dark:bg-slate-800 px-2 py-0.5 rounded-lg">
              {activities.length} événement{activities.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>

        <ActivityFeed activities={activities} isLoading={isLoading} />
      </div>
    </div>
  )
}
