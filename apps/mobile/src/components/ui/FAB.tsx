import { Plus } from 'lucide-react-native';
import { Pressable } from 'react-native';

export function FAB({ onPress }: { onPress?: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      className="absolute bottom-5 right-5 h-14 w-14 items-center justify-center rounded-full bg-[#22C55E] shadow-lg shadow-emerald-500/30 active:bg-[#16A34A]">
      <Plus size={24} color="#ffffff" />
    </Pressable>
  );
}
