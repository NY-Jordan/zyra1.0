import { useRouter } from 'expo-router';
import { AlertCircle, ArrowRight, Building2, CheckCircle, LogOut, MapPin } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Image, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Avatar } from '@/components/ui/Avatar';
import { CARD_CLASS } from '@/components/ui/shared';
import { useAuth } from '@/contexts/AuthContext';
import type { ISalon } from '@zyra/conf/domain/entities/salons.entities';
import { salonService } from '@/services/salonService';

export default function SetupScreen() {
  const router = useRouter();
  const { user, setSalonId, logout } = useAuth();

  const [salons, setSalons] = useState<ISalon[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    if (!user) return;
    salonService
      .getSalonsByOwner(user.uid)
      .then(setSalons)
      .finally(() => setIsLoading(false));
  }, [user]);

  const handleContinue = async () => {
    if (!selectedId) return;
    setIsConnecting(true);
    await setSalonId(selectedId);
    router.replace('/');
  };

  return (
    <SafeAreaView className="flex-1 bg-[#FAF8F6] dark:bg-[#0B0E12]" edges={['top', 'bottom']}>
      <View className="flex-row items-center justify-between px-5 py-4">
        <Image
          source={require('@/assets/images/zyra-logo-light.png')}
          resizeMode="contain"
          className="h-6 w-32 dark:hidden"
        />
        <Image
          source={require('@/assets/images/zyra-logo-dark.png')}
          resizeMode="contain"
          className="hidden h-6 w-32 dark:flex"
        />
        <Pressable onPress={() => logout()} hitSlop={8} className="flex-row items-center gap-2">
          <Avatar name={user?.email ?? 'U'} size={28} />
          <LogOut size={16} color="#94a3b8" />
        </Pressable>
      </View>

      <View className="px-5 pb-3 pt-2">
        <Text className="text-[22px] font-extrabold text-slate-900 dark:text-white">Quel salon gérez-vous ?</Text>
        <Text className="mt-1 text-[13px] text-slate-500 dark:text-slate-400">
          Sélectionnez votre salon pour accéder à votre espace de gestion.
        </Text>
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#059669" />
        </View>
      ) : (
        <FlatList
          data={salons}
          keyExtractor={(item) => item.id}
          contentContainerClassName="gap-3 px-5 pb-4"
          ListEmptyComponent={
            <View className={`${CARD_CLASS} items-center p-10`}>
              <Building2 size={28} color="#cbd5e1" />
              <Text className="mt-3 text-[14px] font-semibold text-slate-700 dark:text-slate-200">
                Aucun salon trouvé
              </Text>
              <Text className="mt-1 text-center text-[12px] text-slate-400">
                Votre compte n'est associé à aucun salon. Contactez l'équipe Zyraa.
              </Text>
            </View>
          }
          renderItem={({ item }) => {
            const isSelected = selectedId === item.id;
            const isConfigured = (item.progress ?? 0) >= 80;
            return (
              <Pressable
                onPress={() => setSelectedId(item.id)}
                className={`${CARD_CLASS} flex-row items-center gap-3 p-4 ${
                  isSelected ? 'border-emerald-400 dark:border-emerald-500' : ''
                }`}>
                <View className="h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10">
                  {typeof item.photos?.[0] === 'string' ? (
                    <Image source={{ uri: item.photos[0] }} className="h-full w-full rounded-xl" resizeMode="cover" />
                  ) : (
                    <Building2 size={20} color="#10b981" />
                  )}
                </View>
                <View className="flex-1">
                  <Text className="text-[14px] font-bold text-slate-800 dark:text-white">{item.name}</Text>
                  {item.address || item.city ? (
                    <View className="mt-0.5 flex-row items-center gap-1">
                      <MapPin size={11} color="#94a3b8" />
                      <Text numberOfLines={1} className="text-[12px] text-slate-400">
                        {item.address || item.city}
                      </Text>
                    </View>
                  ) : null}
                </View>
                {isConfigured ? (
                  <View className="flex-row items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 dark:bg-emerald-950/20">
                    <CheckCircle size={11} color="#059669" />
                    <Text className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">Actif</Text>
                  </View>
                ) : (
                  <View className="flex-row items-center gap-1 rounded-full bg-amber-50 px-2 py-1 dark:bg-amber-950/20">
                    <AlertCircle size={11} color="#d97706" />
                    <Text className="text-[11px] font-semibold text-amber-700 dark:text-amber-400">
                      {item.progress ?? 0}%
                    </Text>
                  </View>
                )}
                <View
                  className={`h-5 w-5 items-center justify-center rounded-full border-2 ${
                    isSelected ? 'border-emerald-500 bg-emerald-500' : 'border-slate-300 dark:border-slate-600'
                  }`}>
                  {isSelected ? <CheckCircle size={12} color="#ffffff" /> : null}
                </View>
              </Pressable>
            );
          }}
        />
      )}

      {salons.length > 0 ? (
        <View className="px-5 pb-4 pt-2">
          <Pressable
            onPress={handleContinue}
            disabled={!selectedId || isConnecting}
            style={{ opacity: !selectedId || isConnecting ? 0.5 : 1 }}
            className="h-12 flex-row items-center justify-center gap-2 rounded-xl bg-[#22C55E] active:bg-[#16A34A]">
            {isConnecting ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <>
                <Text className="text-[14px] font-bold text-white">Accéder au tableau de bord</Text>
                <ArrowRight size={16} color="#ffffff" />
              </>
            )}
          </Pressable>
        </View>
      ) : null}
    </SafeAreaView>
  );
}
