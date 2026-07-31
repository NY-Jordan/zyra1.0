import { useRouter } from 'expo-router';
import {
  Activity,
  BarChart3,
  ChevronRight,
  LogOut,
  Scissors,
  ShieldCheck,
  Store,
  User2,
  Users,
} from 'lucide-react-native';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CARD_CLASS } from '@/components/ui/shared';
import { useAuth } from '@/contexts/AuthContext';

const MENU_ITEMS = [
  { label: 'Services', icon: Scissors, href: '/services' as const, permissionKey: 'services.view' },
  { label: 'Coiffeurs', icon: Users, href: '/hairdressers' as const, permissionKey: 'hairdressers.view' },
  { label: 'Activités', icon: Activity, href: '/activities' as const, permissionKey: 'activities.view' },
  { label: 'Statistiques', icon: BarChart3, href: '/analytics' as const, permissionKey: 'analytics.view' },
  { label: 'Administration', icon: ShieldCheck, href: '/administration' as const, ownerOnly: true },
  { label: 'Paramètres du salon', icon: Store, href: '/settings' as const, permissionKey: 'settings.view' },
  { label: 'Profil', icon: User2, href: '/profile' as const },
];

export default function MoreScreen() {
  const router = useRouter();
  const { logout, accountContext, hasPermission } = useAuth();
  const visibleItems = MENU_ITEMS.filter((item) => {
    if (item.ownerOnly) return accountContext?.type === 'owner';
    if (item.permissionKey) return hasPermission(item.permissionKey);
    return true;
  });

  return (
    <SafeAreaView className="flex-1 bg-[#FAF8F6] dark:bg-[#0B0E12]" edges={['top', 'bottom']}>
      <ScrollView contentContainerClassName="gap-3 p-4" showsVerticalScrollIndicator={false}>
        <Text className="mb-1 text-[20px] font-extrabold text-slate-900 dark:text-white">Plus</Text>

        <View className={CARD_CLASS}>
          {visibleItems.map((item, index) => (
            <Pressable
              key={item.href}
              onPress={() => router.push(item.href)}
              className={`flex-row items-center gap-3 px-4 py-3.5 active:bg-[#F5F2EF] dark:active:bg-slate-800/60 ${
                index !== visibleItems.length - 1 ? 'border-b border-[#F0EAE4] dark:border-slate-800/50' : ''
              }`}>
              <View className="h-8 w-8 items-center justify-center rounded-lg bg-[#F5F2EF] dark:bg-slate-700/50">
                <item.icon size={16} color="#059669" />
              </View>
              <Text className="flex-1 text-[14px] font-semibold text-slate-700 dark:text-slate-200">
                {item.label}
              </Text>
              <ChevronRight size={16} color="#cbd5e1" />
            </Pressable>
          ))}
        </View>

        <Pressable
          onPress={() => logout()}
          className={`${CARD_CLASS} flex-row items-center justify-center gap-2 px-4 py-3.5 active:bg-rose-50 dark:active:bg-rose-950/20`}>
          <LogOut size={16} color="#e11d48" />
          <Text className="text-[14px] font-bold text-rose-600 dark:text-rose-400">Déconnexion</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
