import type { IClient } from '@zyra/conf/domain/entities/clients.entities';
import { Mail, Phone, Search, UserCircle } from 'lucide-react-native';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, Text, View } from 'react-native';

import { Avatar } from '@/components/ui/Avatar';
import { SearchInput } from '@/components/ui/SearchInput';
import { SheetModal } from '@/components/ui/SheetModal';
import { clientService } from '@/services/clientService';

export function ClientSearchModal({
  visible,
  onClose,
  salonId,
  onSelectClient,
}: {
  visible: boolean;
  onClose: () => void;
  salonId: string;
  onSelectClient: (client: IClient) => void;
}) {
  const [search, setSearch] = useState('');
  const [clients, setClients] = useState<IClient[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!visible) return;
    setIsLoading(true);
    clientService
      .getClientsBySalon(salonId)
      .then(setClients)
      .finally(() => setIsLoading(false));
  }, [visible, salonId]);

  const filtered = useMemo(() => {
    if (!search.trim()) return clients;
    const q = search.toLowerCase();
    return clients.filter(
      (c) => c.name.toLowerCase().includes(q) || c.phone.toLowerCase().includes(q) || c.email?.toLowerCase().includes(q)
    );
  }, [clients, search]);

  return (
    <SheetModal visible={visible} onClose={onClose} title="Rechercher un client">
      <SearchInput value={search} onChangeText={setSearch} placeholder="Nom, téléphone ou email..." />

      {isLoading ? (
        <View className="items-center py-8">
          <ActivityIndicator color="#059669" />
        </View>
      ) : filtered.length === 0 ? (
        <View className="items-center py-8">
          <UserCircle size={36} color="#cbd5e1" />
          <Text className="mt-2 text-[13px] text-slate-400">
            {search.trim() ? 'Aucun client trouvé' : 'Aucun client enregistré'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
          contentContainerClassName="gap-2"
          renderItem={({ item }) => (
            <Pressable
              onPress={() => {
                onSelectClient(item);
                setSearch('');
                onClose();
              }}
              className="flex-row items-center gap-3 rounded-xl border border-[#F0EAE4] p-3 active:bg-[#F5F2EF] dark:border-slate-700 dark:active:bg-slate-800/60">
              <Avatar name={item.name} size={40} />
              <View className="flex-1">
                <Text className="text-[13px] font-semibold text-slate-700 dark:text-slate-200">{item.name}</Text>
                <View className="mt-0.5 flex-row items-center gap-1.5">
                  <Phone size={11} color="#94a3b8" />
                  <Text className="text-[11px] text-slate-400">{item.phone}</Text>
                </View>
                {item.email ? (
                  <View className="mt-0.5 flex-row items-center gap-1.5">
                    <Mail size={11} color="#94a3b8" />
                    <Text numberOfLines={1} className="text-[11px] text-slate-400">
                      {item.email}
                    </Text>
                  </View>
                ) : null}
              </View>
            </Pressable>
          )}
        />
      )}
    </SheetModal>
  );
}
