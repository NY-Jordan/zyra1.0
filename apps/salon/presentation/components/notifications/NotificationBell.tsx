'use client'

import React, { useState } from 'react'
import { Bell } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@zyra/ui/components/popover'
import { useNotifications } from '@/hooks/useNotifications'
import { NotificationPanel } from './NotificationPanel'

interface NotificationBellProps {
  salonId: string | null
}

export function NotificationBell({ salonId }: NotificationBellProps) {
  const [open, setOpen] = useState(false)
  const { notifications, unreadCount } = useNotifications(salonId)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label="Notifications"
          className="relative rounded-xl p-2 text-slate-500 transition-colors hover:bg-[#F5F2EF] hover:text-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-[9px] font-extrabold text-white ring-2 ring-white dark:ring-[#10141b]">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        sideOffset={8}
        className="w-[360px] p-0 rounded-2xl border-[#F0EAE4] dark:border-slate-800/50 shadow-xl shadow-black/10 overflow-hidden"
      >
        {salonId && (
          <NotificationPanel
            notifications={notifications}
            unreadCount={unreadCount}
            salonId={salonId}
            onClose={() => setOpen(false)}
          />
        )}
      </PopoverContent>
    </Popover>
  )
}
