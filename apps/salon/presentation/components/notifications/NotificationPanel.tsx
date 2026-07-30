import React from 'react'
import { CheckCheck, Bell } from 'lucide-react'
import { INotification } from '@zyra/core/types/notifications.types'
import { useMarkAllNotificationsRead } from '@zyra/core/usecases/notificationsUseCases'
import { NotificationItem } from './NotificationItem'

interface NotificationPanelProps {
  notifications: INotification[]
  unreadCount: number
  salonId: string
  onClose: () => void
}

export function NotificationPanel({ notifications, unreadCount, salonId, onClose }: NotificationPanelProps) {
  const markAll = useMarkAllNotificationsRead()

  return (
    <div className="flex flex-col" style={{ maxHeight: '480px' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3.5 border-b border-[#F0EAE4] dark:border-slate-800/50 flex-shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-[14px] font-extrabold text-slate-800 dark:text-white">Notifications</span>
          {unreadCount > 0 && (
            <span className="h-5 min-w-5 px-1.5 rounded-full bg-emerald-500 text-white text-[10px] font-extrabold flex items-center justify-center">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            type="button"
            onClick={() => markAll.mutate(salonId)}
            disabled={markAll.isPending}
            className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 disabled:opacity-50 transition-colors"
          >
            <CheckCheck className="h-3.5 w-3.5" />
            Tout marquer lu
          </button>
        )}
      </div>

      {/* List */}
      <div className="overflow-y-auto flex-1">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#F5F2EF] dark:bg-slate-800 flex items-center justify-center">
              <Bell className="h-5 w-5 text-slate-400" />
            </div>
            <p className="text-[13px] font-semibold text-slate-500 dark:text-slate-400">Aucune notification</p>
          </div>
        ) : (
          <div className="divide-y divide-[#F0EAE4] dark:divide-slate-800/40">
            {notifications.map(n => (
              <NotificationItem key={n.id} notification={n} onClose={onClose} />
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      {notifications.length > 0 && (
        <div className="border-t border-[#F0EAE4] dark:border-slate-800/50 px-4 py-2.5 flex-shrink-0">
          <p className="text-[11px] text-center text-slate-400 dark:text-slate-500">
            {notifications.length} notification{notifications.length !== 1 ? 's' : ''} · les 50 dernières
          </p>
        </div>
      )}
    </div>
  )
}
