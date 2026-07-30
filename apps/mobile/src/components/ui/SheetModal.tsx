import { X } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { Modal, Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type SheetModalProps = {
  visible: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
};

export function SheetModal({ visible, onClose, title, children, footer }: SheetModalProps) {
  const insets = useSafeAreaInsets();

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View className="flex-1 justify-end bg-black/40">
        <Pressable className="absolute inset-0" onPress={onClose} />
        <View
          className="max-h-[88%] rounded-t-3xl bg-white dark:bg-[#11151C]"
          style={{ paddingBottom: insets.bottom }}>
          <View className="flex-row items-center justify-between border-b border-[#F0EAE4] px-5 py-4 dark:border-slate-800/60">
            <Text className="text-[15px] font-bold text-slate-900 dark:text-white">{title}</Text>
            <Pressable
              onPress={onClose}
              hitSlop={8}
              className="h-8 w-8 items-center justify-center rounded-full active:bg-slate-100 dark:active:bg-slate-800">
              <X size={18} color="#64748b" />
            </Pressable>
          </View>
          <ScrollView className="px-5 py-4" contentContainerClassName="gap-4">
            {children}
          </ScrollView>
          {footer ? (
            <View className="border-t border-[#F0EAE4] px-5 py-4 dark:border-slate-800/60">{footer}</View>
          ) : null}
        </View>
      </View>
    </Modal>
  );
}
