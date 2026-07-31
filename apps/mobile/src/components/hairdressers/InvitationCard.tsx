import { hairDresserInvitationStatusEnum } from '@zyra/conf/domain/entities/hairdressers.entities';
import { Text, View } from 'react-native';

import { Avatar } from '@/components/ui/Avatar';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { CARD_CLASS } from '@/components/ui/shared';
import type { StatusTone } from '@/components/ui/shared';

import type { Invitation } from './types';

const LABELS: Record<hairDresserInvitationStatusEnum, string> = {
  [hairDresserInvitationStatusEnum.PENDING]: 'En attente',
  [hairDresserInvitationStatusEnum.ACCEPTED]: 'Acceptée',
  [hairDresserInvitationStatusEnum.REJECTED]: 'Refusée',
  [hairDresserInvitationStatusEnum.EXPIRED]: 'Expirée',
};

const TONES: Record<hairDresserInvitationStatusEnum, StatusTone> = {
  [hairDresserInvitationStatusEnum.PENDING]: 'amber',
  [hairDresserInvitationStatusEnum.ACCEPTED]: 'emerald',
  [hairDresserInvitationStatusEnum.REJECTED]: 'rose',
  [hairDresserInvitationStatusEnum.EXPIRED]: 'slate',
};

export function InvitationCard({ invitation }: { invitation: Invitation }) {
  return (
    <View className={`${CARD_CLASS} flex-row items-center gap-3 p-4`}>
      <Avatar name={invitation.name} size={40} />
      <View className="flex-1">
        <Text className="text-[13px] font-bold text-slate-800 dark:text-white">{invitation.name}</Text>
        <Text className="text-[11px] text-slate-400">{invitation.email}</Text>
        <Text className="mt-0.5 text-[11px] text-slate-400">Envoyée le {invitation.sentDate}</Text>
      </View>
      <StatusBadge label={LABELS[invitation.status]} tone={TONES[invitation.status]} />
    </View>
  );
}
