import { Search } from 'lucide-react-native';
import { TextInput, View } from 'react-native';

type SearchInputProps = {
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
};

export function SearchInput({ value, onChangeText, placeholder = 'Rechercher...' }: SearchInputProps) {
  return (
    <View className="h-11 flex-row items-center gap-2.5 rounded-xl border border-[#E8E0D8] bg-white px-3.5 dark:border-slate-700 dark:bg-slate-900">
      <Search size={16} color="#94a3b8" />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#94a3b8"
        className="flex-1 text-[14px] text-slate-800 dark:text-white"
      />
    </View>
  );
}
