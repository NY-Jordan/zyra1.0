import type { ActivityType, IActivity, ResourceType } from '@zyra/core/types/notifications.types';

import { auth } from '@/lib/firebase';
import { createDocument } from '@/lib/query';

export type LogActivityParams = {
  salonId: string;
  type: ActivityType;
  action: string;
  resourceId: string;
  resourceType: ResourceType;
  resourceLabel?: string;
  metadata?: Record<string, unknown>;
};

/** Mirrors packages/core/src/usecases/notificationsUseCases.ts's logActivity, bound to mobile's own auth/db. */
export const activityService = {
  async logActivity(params: LogActivityParams): Promise<void> {
    try {
      const user = auth.currentUser;
      const payload: Omit<IActivity, 'id' | 'createdAt'> = {
        salonId: params.salonId,
        type: params.type,
        actorId: user?.uid ?? 'system',
        actorName: user?.displayName ?? 'Système',
        action: params.action,
        resourceId: params.resourceId,
        resourceType: params.resourceType,
        resourceLabel: params.resourceLabel ?? '',
        ...(params.metadata ? { metadata: params.metadata } : {}),
      };
      await createDocument('activities', payload);
    } catch (error) {
      if (__DEV__) console.warn('[activityService] logActivity failed:', error);
    }
  },
};
