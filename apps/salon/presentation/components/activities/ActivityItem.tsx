import React from 'react'
import { IActivity } from '@/types/notifications.types'
import { ACTIVITY_CONFIG, formatRelativeTime, getDefaultFallback } from './activityConfig'

interface ActivityItemProps {
  activity: IActivity
  showDate?: boolean
}

export function ActivityItem({ activity, showDate = false }: ActivityItemProps) {
  const config = ACTIVITY_CONFIG[activity.type] ?? getDefaultFallback()

  const date = activity.createdAt?.toDate?.()
  const timeLabel = date ? formatRelativeTime(date) : ''
  const fullDate = date
    ? date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    : ''

  return (
    <div className="flex items-start gap-3 px-4 py-3 hover:bg-[#F8F4F0] dark:hover:bg-slate-800/30 transition-colors group">
      {/* Icon dot */}
      <div className={`w-7 h-7 rounded-xl flex-shrink-0 flex items-center justify-center mt-0.5 ${config.bgColor}`}>
        {config.icon}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-[13px] text-slate-700 dark:text-slate-300 leading-snug">
          <span className="font-semibold text-slate-800 dark:text-white">{activity.actorName}</span>
          {' '}
          <span>{config.actionVerb}</span>
          {' '}
          <span className="font-medium text-slate-700 dark:text-slate-200">{activity.resourceLabel}</span>
        </p>

        {activity.metadata && Object.keys(activity.metadata).length > 0 && (
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
            {Object.entries(activity.metadata)
              .filter(([, v]) => v !== undefined && v !== null && v !== '')
              .map(([k, v]) => `${k}: ${v}`)
              .join(' · ')}
          </p>
        )}

        <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5" title={fullDate}>
          {showDate && date
            ? date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
            : timeLabel}
        </p>
      </div>

      {/* Type badge */}
      <span className="hidden sm:flex items-center flex-shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity bg-[#F0EAE4] dark:bg-slate-700/60 text-slate-500 dark:text-slate-400">
        {config.label}
      </span>
    </div>
  )
}
