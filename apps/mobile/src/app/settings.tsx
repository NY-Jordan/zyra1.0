import { Clock, Image as ImageIcon, MapPin, Store } from 'lucide-react-native';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CARD_CLASS } from '@/components/ui/shared';

const HOURS = [
  { day: 'Lundi', open: '08:00', close: '19:00', isOpen: true },
  { day: 'Mardi', open: '08:00', close: '19:00', isOpen: true },
  { day: 'Mercredi', open: '08:00', close: '19:00', isOpen: true },
  { day: 'Jeudi', open: '08:00', close: '19:00', isOpen: true },
  { day: 'Vendredi', open: '08:00', close: '20:00', isOpen: true },
  { day: 'Samedi', open: '08:00', close: '20:00', isOpen: true },
  { day: 'Dimanche', open: '—', close: '—', isOpen: false },
];

function SectionCard({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <View className={`${CARD_CLASS} p-5`}>
      <View className="mb-3 flex-row items-center gap-2">
        <View className="h-7 w-7 items-center justify-center rounded-lg bg-[#F5F2EF] dark:bg-slate-700/50">
          {icon}
        </View>
        <Text className="text-[13px] font-bold text-slate-800 dark:text-white">{title}</Text>
      </View>
      {children}
    </View>
  );
}

export default function SettingsScreen() {
  return (
    <SafeAreaView className="flex-1 bg-[#FAF8F6] dark:bg-[#0B0E12]" edges={['bottom']}>
      <ScrollView contentContainerClassName="gap-3 p-4" showsVerticalScrollIndicator={false}>
        <View className={`${CARD_CLASS} p-5`}>
          <View className="mb-1 flex-row items-center gap-3">
            <View className="h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10">
              <Store size={20} color="#10b981" />
            </View>
            <View>
              <Text className="text-[15px] font-extrabold text-slate-800 dark:text-white">Zyra Coiffure</Text>
              <Text className="text-[12px] text-slate-400">Salon de coiffure</Text>
            </View>
          </View>
        </View>

        <SectionCard icon={<Store size={14} color="#059669" />} title="Informations">
          <View className="gap-2">
            <Text className="text-[13px] text-slate-600 dark:text-slate-300">Nom : Zyra Coiffure</Text>
            <Text className="text-[13px] text-slate-600 dark:text-slate-300">Téléphone : +237 6 90 00 00 00</Text>
            <Text className="text-[13px] text-slate-600 dark:text-slate-300">Email : contact@zyracoiffure.com</Text>
          </View>
        </SectionCard>

        <SectionCard icon={<Clock size={14} color="#059669" />} title="Horaires d'ouverture">
          <View className="gap-2">
            {HOURS.map((h) => (
              <View key={h.day} className="flex-row items-center justify-between">
                <Text className="text-[13px] text-slate-600 dark:text-slate-300">{h.day}</Text>
                <Text className={`text-[13px] font-semibold ${h.isOpen ? 'text-slate-700 dark:text-slate-300' : 'text-slate-400'}`}>
                  {h.isOpen ? `${h.open} - ${h.close}` : 'Fermé'}
                </Text>
              </View>
            ))}
          </View>
        </SectionCard>

        <SectionCard icon={<MapPin size={14} color="#059669" />} title="Localisation">
          <Text className="text-[13px] text-slate-600 dark:text-slate-300">12 Avenue Kennedy, Douala</Text>
        </SectionCard>

        <SectionCard icon={<ImageIcon size={14} color="#059669" />} title="Galerie">
          <View className="flex-row flex-wrap gap-2">
            {[1, 2, 3].map((i) => (
              <View key={i} className="h-16 w-16 items-center justify-center rounded-xl bg-[#F5F2EF] dark:bg-slate-800/40">
                <ImageIcon size={16} color="#cbd5e1" />
              </View>
            ))}
          </View>
        </SectionCard>
      </ScrollView>
    </SafeAreaView>
  );
}
