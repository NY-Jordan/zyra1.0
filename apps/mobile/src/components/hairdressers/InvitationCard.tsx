import { Text, View } from 'react-native';

import { Avatar } from '@/components/ui/Avatar';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { CARD_CLASS } from '@/components/ui/shared';

import type { Invitation, InvitationStatus } from './types';

const LABELS: Record<InvitationStatus, string> = {
  pending: 'En attente',
  accepted: 'Acceptée',
  rejected: 'Refusée',
  expired: 'Expirée',
};

const TONES: Record<InvitationStatus, 'amber' | 'emerald' | 'rose' | 'slate'> = {
  pending: 'amber',
  accepted: 'emerald',
  rejected: 'rose',
  expired: 'slate',
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
