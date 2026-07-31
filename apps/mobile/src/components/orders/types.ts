import { orderStatusEnum } from '@zyra/conf/domain/enums/OrderEnum';

import type { StatusTone } from '@/components/ui/shared';

export const ORDER_STATUS_LABELS: Record<orderStatusEnum, string> = {
  [orderStatusEnum.pending]: 'En attente',
  [orderStatusEnum.completed]: 'Terminée',
  [orderStatusEnum.canceled]: 'Annulée',
};

export const ORDER_STATUS_TONES: Record<orderStatusEnum, StatusTone> = {
  [orderStatusEnum.pending]: 'amber',
  [orderStatusEnum.completed]: 'emerald',
  [orderStatusEnum.canceled]: 'rose',
};
