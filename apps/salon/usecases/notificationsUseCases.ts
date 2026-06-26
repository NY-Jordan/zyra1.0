import { createDocument, editDocument, fetchCollection } from '@zyra/conf/lib/query'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { where } from 'firebase/firestore'
import { auth } from '@zyra/conf/lib/firebase'
import {
  ActivityType,
  IActivity,
  INotification,
  LogContext,
  ResourceType,
} from '@/types/notifications.types'

export function getCurrentActor(): { actorId: string; actorName: string } {
  const user = auth.currentUser
  return {
    actorId: user?.uid ?? 'system',
    actorName: user?.displayName ?? 'Système',
  }
}

// ── Standalone fire-and-forget utilities ─────────────────────────────────────

export interface LogActivityParams extends LogContext {
  type: ActivityType
  action: string
  resourceId: string
  resourceType: ResourceType
  metadata?: Record<string, unknown>
}

export interface CreateNotificationParams {
  salonId: string
  type: ActivityType
  title: string
  body: string
  resourceId: string
  resourceType: ResourceType
}

export const logActivity = async (params: LogActivityParams): Promise<void> => {
  try {
    const payload: Omit<IActivity, 'id' | 'createdAt'> = {
      salonId: params.salonId,
      type: params.type,
      actorId: params.actorId,
      actorName: params.actorName,
      action: params.action,
      resourceId: params.resourceId,
      resourceType: params.resourceType,
      resourceLabel: params.resourceLabel ?? '',
      ...(params.metadata ? { metadata: params.metadata } : {}),
    }
    await createDocument('activities', payload)
  } catch (e) {
    console.error('[logActivity]', e)
  }
}

export const createNotification = async (params: CreateNotificationParams): Promise<void> => {
  try {
    const payload: Omit<INotification, 'id' | 'createdAt'> = {
      salonId: params.salonId,
      type: params.type,
      title: params.title,
      body: params.body,
      resourceId: params.resourceId,
      resourceType: params.resourceType,
      read: false,
    }
    await createDocument('notifications', payload)
  } catch (e) {
    console.error('[createNotification]', e)
  }
}

// ── TanStack Query mutations ──────────────────────────────────────────────────

export const useMarkNotificationRead = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (notificationId: string) => {
      await editDocument('notifications', notificationId, { read: true })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    },
  })
}

export const useMarkAllNotificationsRead = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (salonId: string) => {
      const unread = await fetchCollection('notifications', [
        where('salonId', '==', salonId),
        where('read', '==', false),
      ])
      await Promise.all(unread.map(n => editDocument('notifications', n.id, { read: true })))
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    },
  })
}
