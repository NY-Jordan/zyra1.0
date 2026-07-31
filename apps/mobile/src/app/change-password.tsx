import { useRouter } from 'expo-router';
import { AlertCircle, ArrowRight, KeyRound, Lock } from 'lucide-react-native';
import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '@/contexts/AuthContext';
import { authService } from '@/services/authService';

export default function ChangePasswordScreen() {
  const router = useRouter();
  const { refreshAccountContext } = useAuth();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    setError('');

    if (newPassword.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }

    setIsLoading(true);
    try {
      await authService.updateMemberPassword(newPassword);
      await refreshAccountContext();
      router.replace('/');
    } catch (err: any) {
      setError(err?.message || 'Une erreur est survenue. Réessayez.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-[#0B0E12]" edges={['top', 'bottom']}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1">
        <ScrollView contentContainerClassName="flex-grow justify-center px-6 py-8" keyboardShouldPersistTaps="handled">
          <View className="items-center">
            <View className="mb-6 h-14 w-14 items-center justify-center rounded-2xl bg-[#EEF8F0] dark:bg-emerald-950/20">
              <KeyRound size={24} color="#059669" />
            </View>
            <Text className="mb-2 text-center text-[17px] font-bold text-slate-800 dark:text-white">
              Choisissez votre mot de passe
            </Text>
            <Text className="mb-7 text-center text-[13px] leading-relaxed text-slate-500 dark:text-slate-400">
              Pour des raisons de sécurité, vous devez définir un nouveau mot de passe avant d'accéder à votre
              espace.
            </Text>
          </View>

          {error ? (
            <View className="mb-5 flex-row items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 dark:border-rose-800/40 dark:bg-rose-950/20">
              <AlertCircle size={16} color="#e11d48" style={{ marginTop: 2 }} />
              <Text className="flex-1 text-[13px] text-rose-700 dark:text-rose-400">{error}</Text>
            </View>
          ) : null}

          <View className="gap-4">
            <View>
              <Text className="mb-1.5 text-[13px] font-semibold text-slate-700 dark:text-slate-300">
                Nouveau mot de passe
              </Text>
              <View className="h-12 flex-row items-center rounded-xl border border-slate-200 bg-white px-3.5 dark:border-slate-700 dark:bg-slate-900">
                <Lock size={16} color="#94a3b8" />
                <TextInput
                  value={newPassword}
                  onChangeText={setNewPassword}
                  placeholder="••••••••"
                  placeholderTextColor="#94a3b8"
                  secureTextEntry
                  autoCapitalize="none"
                  className="ml-2.5 flex-1 text-[14px] text-slate-800 dark:text-white"
                />
              </View>
            </View>

            <View>
              <Text className="mb-1.5 text-[13px] font-semibold text-slate-700 dark:text-slate-300">
                Confirmer le mot de passe
              </Text>
              <View className="h-12 flex-row items-center rounded-xl border border-slate-200 bg-white px-3.5 dark:border-slate-700 dark:bg-slate-900">
                <Lock size={16} color="#94a3b8" />
                <TextInput
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="••••••••"
                  placeholderTextColor="#94a3b8"
                  secureTextEntry
                  autoCapitalize="none"
                  className="ml-2.5 flex-1 text-[14px] text-slate-800 dark:text-white"
                />
              </View>
            </View>

            <Pressable
              onPress={handleSubmit}
              disabled={isLoading}
              className="mt-2 h-12 flex-row items-center justify-center gap-2 rounded-xl bg-[#22C55E] active:bg-[#16A34A]"
              style={{ opacity: isLoading ? 0.6 : 1 }}>
              {isLoading ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <>
                  <Text className="text-[14px] font-bold text-white">Continuer</Text>
                  <ArrowRight size={16} color="#ffffff" />
                </>
              )}
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
