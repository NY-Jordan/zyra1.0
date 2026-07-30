import { Lock, Mail, User2 } from 'lucide-react-native';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Avatar } from '@/components/ui/Avatar';
import { CARD_CLASS } from '@/components/ui/shared';

export default function ProfileScreen() {
  return (
    <SafeAreaView className="flex-1 bg-[#FAF8F6] dark:bg-[#0B0E12]" edges={['bottom']}>
      <ScrollView contentContainerClassName="gap-3 p-4" showsVerticalScrollIndicator={false}>
        <View className={`${CARD_CLASS} items-center gap-3 p-6`}>
          <Avatar name="Awa Zogo" size={72} />
          <View className="items-center">
            <Text className="text-[16px] font-extrabold text-slate-800 dark:text-white">Awa Zogo</Text>
            <View className="mt-1 rounded-full bg-emerald-50 px-2.5 py-1 dark:bg-emerald-950/20">
              <Text className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">Propriétaire</Text>
            </View>
          </View>
        </View>

        <View className={`${CARD_CLASS} p-5`}>
          <View className="gap-3">
            <View className="flex-row items-center gap-2.5">
              <Mail size={14} color="#64748b" />
              <Text className="text-[13px] text-slate-600 dark:text-slate-300">awa.zogo@example.com</Text>
            </View>
            <View className="flex-row items-center gap-2.5">
              <User2 size={14} color="#64748b" />
              <Text className="text-[13px] text-slate-600 dark:text-slate-300">Membre depuis le 12 Jan 2026</Text>
            </View>
          </View>
        </View>

        <Pressable className={`${CARD_CLASS} flex-row items-center gap-3 p-4 active:bg-[#F5F2EF] dark:active:bg-slate-800/60`}>
          <View className="h-9 w-9 items-center justify-center rounded-lg bg-[#F5F2EF] dark:bg-slate-700/50">
            <Lock size={16} color="#059669" />
          </View>
          <Text className="flex-1 text-[14px] font-semibold text-slate-700 dark:text-slate-200">
            Changer le mot de passe
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
