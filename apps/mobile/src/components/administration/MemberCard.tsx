import { getRole } from '@zyra/conf/domain/entities/permissions.entities';
import { Text, View } from 'react-native';

import { Avatar } from '@/components/ui/Avatar';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { CARD_CLASS } from '@/components/ui/shared';

import { MEMBER_STATUS_LABELS, MEMBER_STATUS_TONES, type TeamMember } from './types';

export function MemberCard({ member }: { member: TeamMember }) {
  return (
    <View className={`${CARD_CLASS} flex-row items-center gap-3 p-4`}>
      <Avatar name={member.name} size={44} />
      <View className="flex-1">
        <Text className="text-[14px] font-bold text-slate-800 dark:text-white">{member.name}</Text>
        <Text className="text-[12px] text-slate-400">{member.email}</Text>
        <View className="mt-1.5 flex-row items-center gap-1.5">
          <View className="rounded-full bg-[#F5F2EF] px-2 py-0.5 dark:bg-slate-700/50">
            <Text className="text-[10px] font-semibold text-slate-600 dark:text-slate-300">
              {getRole(member.role).label}
            </Text>
          </View>
          <StatusBadge label={MEMBER_STATUS_LABELS[member.status]} tone={MEMBER_STATUS_TONES[member.status]} />
        </View>
      </View>
    </View>
  );
}
