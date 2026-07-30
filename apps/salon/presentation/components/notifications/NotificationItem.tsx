import React from 'react'
import { INotification } from '@zyra/core/types/notifications.types'
import { ACTIVITY_CONFIG, formatRelativeTime, getDefaultFallback } from '../activities/activityConfig'
import { useMarkNotificationRead } from '@zyra/core/usecases/notificationsUseCases'

interface NotificationItemProps {
  notification: INotification
  onClose?: () => void
}

export function NotificationItem({ notification, onClose }: NotificationItemProps) {
  const config = ACTIVITY_CONFIG[notification.type] ?? getDefaultFallback()
  const markRead = useMarkNotificationRead()

  const date = notification.createdAt?.toDate?.()
  const timeLabel = date ? formatRelativeTime(date) : ''

  const handleClick = () => {
    if (!notification.read) {
      markRead.mutate(notification.id)
    }
    onClose?.()
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`w-full flex items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-[#F8F4F0] dark:hover:bg-slate-800/30 ${
        !notification.read ? 'bg-[#F5FBF8] dark:bg-emerald-950/10' : ''
      }`}
    >
      {/* Unread dot */}
      <div className="relative flex-shrink-0 mt-0.5">
        <div className={`w-7 h-7 rounded-xl flex items-center justify-center ${config.bgColor}`}>
          {config.icon}
        </div>
        {!notification.read && (
          <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-[#161B24]" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className={`text-[13px] leading-snug ${notification.read ? 'text-slate-600 dark:text-slate-400' : 'font-semibold text-slate-800 dark:text-white'}`}>
          {notification.title}
        </p>
        {notification.body && (
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 line-clamp-2">
            {notification.body}
          </p>
        )}
        <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">{timeLabel}</p>
      </div>
    </button>
  )
}
