import { Copy, Eye, ExternalLink, MessageCircle, Share2 } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { SectionHeader } from './SectionHeader';
import { CARD_CLASS } from './shared';

function ActionButton({
  icon,
  label,
  variant = 'default',
  onPress,
}: {
  icon: React.ReactNode;
  label: string;
  variant?: 'default' | 'whatsapp';
  onPress?: () => void;
}) {
  const isWhatsapp = variant === 'whatsapp';
  return (
    <Pressable
      onPress={onPress}
      className={`h-9 flex-row items-center gap-2 rounded-xl border px-3 ${
        isWhatsapp
          ? 'border-emerald-200 bg-emerald-50 active:bg-emerald-100 dark:border-emerald-800/50 dark:bg-emerald-950/20'
          : 'border-[#E8E0D8] active:bg-[#F5F2EF] dark:border-slate-700 dark:active:bg-slate-800'
      }`}>
      {icon}
      <Text
        className={`text-[12px] font-semibold ${
          isWhatsapp ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-600 dark:text-slate-300'
        }`}>
        {label}
      </Text>
    </Pressable>
  );
}

export function BookingLinkCard({ bookingLink, salonName }: { bookingLink: string; salonName: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <View className={`${CARD_CLASS} p-5`}>
      <SectionHeader icon={<Share2 size={14} color="#059669" />} title="Lien de réservation" />

      <View className="gap-4">
        <View>
          <Text className="mb-1.5 text-[11px] font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500">
            Votre lien de réservation
          </Text>
          <View className="flex-row items-center gap-2">
            <View className="h-9 flex-1 justify-center rounded-xl border border-[#E8E0D8] px-3 dark:border-slate-700">
              <Text numberOfLines={1} className="text-[11px] text-slate-500 dark:text-slate-400">
                {bookingLink}
              </Text>
            </View>
            <Pressable
              onPress={handleCopy}
              className="h-9 w-9 items-center justify-center rounded-xl border border-[#E8E0D8] active:bg-[#F5F2EF] dark:border-slate-700 dark:active:bg-slate-800">
              {copied ? (
                <Text className="text-[10px] font-bold text-emerald-600">OK</Text>
              ) : (
                <Copy size={14} color="#64748b" />
              )}
            </Pressable>
          </View>
        </View>

        <View className="gap-2">
          <Text className="text-[11px] font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500">
            Actions
          </Text>
          <View className="gap-1.5">
            <ActionButton icon={<Eye size={14} color="#64748b" />} label="Prévisualiser" />
            <ActionButton
              icon={<MessageCircle size={14} color="#059669" />}
              label="Partager sur WhatsApp"
              variant="whatsapp"
            />
            <ActionButton
              icon={<Copy size={14} color="#64748b" />}
              label={copied ? 'Lien copié !' : 'Copier le lien'}
              onPress={handleCopy}
            />
          </View>
        </View>

        <View className="flex-row items-start gap-2.5 rounded-xl bg-[#F8F4F0] px-3.5 py-3 dark:bg-slate-800/40">
          <ExternalLink size={16} color="#10b981" style={{ marginTop: 2 }} />
          <View className="flex-1">
            <Text className="text-[12px] font-bold text-slate-700 dark:text-slate-300">
              Partagez votre lien
            </Text>
            <Text className="mt-0.5 text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
              Vos clients peuvent réserver 24h/24 via ce lien pour {salonName}.
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}
