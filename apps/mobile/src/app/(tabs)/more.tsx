import { useRouter } from 'expo-router';
import {
  Activity,
  BarChart3,
  ChevronRight,
  LogOut,
  ShieldCheck,
  ShoppingBag,
  Store,
  User2,
  Users,
} from 'lucide-react-native';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CARD_CLASS } from '@/components/ui/shared';

const MENU_ITEMS = [
  { label: 'Commandes', icon: ShoppingBag, href: '/orders' as const },
  { label: 'Coiffeurs', icon: Users, href: '/hairdressers' as const },
  { label: 'Activités', icon: Activity, href: '/activities' as const },
  { label: 'Statistiques', icon: BarChart3, href: '/analytics' as const },
  { label: 'Administration', icon: ShieldCheck, href: '/administration' as const },
  { label: 'Paramètres du salon', icon: Store, href: '/settings' as const },
  { label: 'Profil', icon: User2, href: '/profile' as const },
];

export default function MoreScreen() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-[#FAF8F6] dark:bg-[#0B0E12]" edges={['top', 'bottom']}>
      <ScrollView contentContainerClassName="gap-3 p-4" showsVerticalScrollIndicator={false}>
        <Text className="mb-1 text-[20px] font-extrabold text-slate-900 dark:text-white">Plus</Text>

        <View className={CARD_CLASS}>
          {MENU_ITEMS.map((item, index) => (
            <Pressable
              key={item.href}
              onPress={() => router.push(item.href)}
              className={`flex-row items-center gap-3 px-4 py-3.5 active:bg-[#F5F2EF] dark:active:bg-slate-800/60 ${
                index !== MENU_ITEMS.length - 1 ? 'border-b border-[#F0EAE4] dark:border-slate-800/50' : ''
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
          onPress={() => router.replace('/login')}
          className={`${CARD_CLASS} flex-row items-center justify-center gap-2 px-4 py-3.5 active:bg-rose-50 dark:active:bg-rose-950/20`}>
          <LogOut size={16} color="#e11d48" />
          <Text className="text-[14px] font-bold text-rose-600 dark:text-rose-400">Déconnexion</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
