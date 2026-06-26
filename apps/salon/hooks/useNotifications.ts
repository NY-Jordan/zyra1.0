'use client'

import { useState, useEffect, useRef } from 'react'
import { db } from '@zyra/conf/lib/firebase'
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
} from 'firebase/firestore'
import { INotification } from '@/types/notifications.types'

function playNotificationSound() {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.type = 'sine'
    osc.frequency.setValueAtTime(880, ctx.currentTime)
    osc.frequency.setValueAtTime(1100, ctx.currentTime + 0.08)
    osc.frequency.setValueAtTime(880, ctx.currentTime + 0.16)
    gain.gain.setValueAtTime(0, ctx.currentTime)
    gain.gain.linearRampToValueAtTime(0.25, ctx.currentTime + 0.02)
    gain.gain.setValueAtTime(0.25, ctx.currentTime + 0.18)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5)
    osc.start(ctx.currentTime)
    osc.stop(ctx.currentTime + 0.5)
  } catch (_) {}
}

export const useNotifications = (salonId: string | null) => {
  const [notifications, setNotifications] = useState<INotification[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const prevUnreadRef = useRef<number | null>(null)

  useEffect(() => {
    if (!salonId) {
      setNotifications([])
      setIsLoading(false)
      return
    }

    const q = query(
      collection(db, 'notifications'),
      where('salonId', '==', salonId),
      orderBy('createdAt', 'desc'),
      limit(50),
    )

    const unsub = onSnapshot(q, snapshot => {
      const notifs = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as INotification))
      const unread = notifs.filter(n => !n.read).length
      if (prevUnreadRef.current !== null && unread > prevUnreadRef.current) {
        playNotificationSound()
      }
      prevUnreadRef.current = unread
      setNotifications(notifs)
      setIsLoading(false)
    })

    return unsub
  }, [salonId])

  const unreadCount = notifications.filter(n => !n.read).length

  return { notifications, unreadCount, isLoading }
}
