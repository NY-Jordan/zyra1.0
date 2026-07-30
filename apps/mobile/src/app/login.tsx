import { useRouter } from 'expo-router';
import { AlertCircle, ArrowLeft, ArrowRight, Lock, Mail } from 'lucide-react-native';
import { useState } from 'react';
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  useColorScheme,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const EMAIL_PATTERN = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;

type FormErrors = {
  email?: string;
  password?: string;
};

export default function LoginScreen() {
  const router = useRouter();
  const isDark = useColorScheme() === 'dark';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [connectionError, setConnectionError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const mutedColor = isDark ? '#64748b' : '#94a3b8';
  const errorColor = isDark ? '#fb7185' : '#e11d48';

  const validate = () => {
    const nextErrors: FormErrors = {};
    if (!email) {
      nextErrors.email = "L'adresse e-mail est requise";
    } else if (!EMAIL_PATTERN.test(email)) {
      nextErrors.email = "L'adresse e-mail est invalide";
    }
    if (!password) {
      nextErrors.password = 'Le mot de passe est requis';
    } else if (password.length < 6) {
      nextErrors.password = 'Le mot de passe doit contenir au moins 6 caractères';
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleAuth = async () => {
    setConnectionError('');
    if (!validate()) return;

    setIsLoading(true);
    try {
      // TODO: brancher l'authentification réelle (Firebase / ownerAuthService)
      await new Promise((resolve) => setTimeout(resolve, 800));
      router.replace('/');
    } catch (error: any) {
      setConnectionError(error?.message || 'Une erreur est survenue. Vérifiez votre connexion internet.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-[#0B0E12]" edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1"
      >
        <ScrollView
          contentContainerClassName="flex-grow px-6 py-8"
          keyboardShouldPersistTaps="handled"
        >
          {router.canGoBack() && (
            <Pressable
              onPress={() => router.back()}
              hitSlop={8}
              className="mb-6 h-9 w-9 items-center justify-center rounded-full active:bg-slate-100 dark:active:bg-slate-800/70"
            >
              <ArrowLeft size={20} color={isDark ? '#94a3b8' : '#64748b'} />
            </Pressable>
          )}

          <View className="flex-1 justify-center">
            <Image
              source={require('@/assets/images/zyra-logo-light.png')}
              resizeMode="contain"
              className="mb-10 h-7 w-36 dark:hidden"
            />
            <Image
              source={require('@/assets/images/zyra-logo-dark.png')}
              resizeMode="contain"
              className="mb-10 hidden h-7 w-36 dark:flex"
            />

            <Text className="mb-2 text-[26px] font-extrabold tracking-tight text-slate-900 dark:text-white">
              Zyra pour les professionnels
            </Text>
            <Text className="mb-8 text-[14px] leading-relaxed text-slate-500 dark:text-slate-400">
              Connectez-vous pour gérer votre salon, votre équipe et vos rendez-vous.
            </Text>

            {connectionError ? (
              <View className="mb-5 flex-row items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 dark:border-rose-800/40 dark:bg-rose-950/20">
                <AlertCircle size={16} color={errorColor} style={{ marginTop: 2 }} />
                <Text className="flex-1 text-[13px] text-rose-700 dark:text-rose-400">
                  {connectionError}
                </Text>
              </View>
            ) : null}

            <View className="gap-4">
              <View>
                <Text className="mb-1.5 text-[13px] font-semibold text-slate-700 dark:text-slate-300">
                  Adresse e-mail
                </Text>
                <View className="h-12 flex-row items-center rounded-xl border border-slate-200 bg-white px-3.5 dark:border-slate-700 dark:bg-slate-900">
                  <Mail size={16} color={mutedColor} />
                  <TextInput
                    value={email}
                    onChangeText={setEmail}
                    placeholder="exemple@domaine.com"
                    placeholderTextColor={mutedColor}
                    autoCapitalize="none"
                    autoComplete="email"
                    keyboardType="email-address"
                    className="ml-2.5 flex-1 text-[14px] text-slate-800 dark:text-white"
                  />
                </View>
                {errors.email ? (
                  <View className="mt-1.5 flex-row items-center gap-1">
                    <AlertCircle size={12} color={errorColor} />
                    <Text className="text-[11px] text-rose-500">{errors.email}</Text>
                  </View>
                ) : null}
              </View>

              <View>
                <View className="mb-1.5 flex-row items-center justify-between">
                  <Text className="text-[13px] font-semibold text-slate-700 dark:text-slate-300">
                    Mot de passe
                  </Text>
                  <Pressable hitSlop={8}>
                    <Text className="text-[12px] font-semibold text-emerald-600 dark:text-emerald-400">
                      Oublié ?
                    </Text>
                  </Pressable>
                </View>
                <View className="h-12 flex-row items-center rounded-xl border border-slate-200 bg-white px-3.5 dark:border-slate-700 dark:bg-slate-900">
                  <Lock size={16} color={mutedColor} />
                  <TextInput
                    value={password}
                    onChangeText={setPassword}
                    placeholder="••••••••"
                    placeholderTextColor={mutedColor}
                    secureTextEntry
                    autoCapitalize="none"
                    autoComplete="password"
                    className="ml-2.5 flex-1 text-[14px] text-slate-800 dark:text-white"
                  />
                </View>
                {errors.password ? (
                  <View className="mt-1.5 flex-row items-center gap-1">
                    <AlertCircle size={12} color={errorColor} />
                    <Text className="text-[11px] text-rose-500">{errors.password}</Text>
                  </View>
                ) : null}
              </View>

              <Pressable
                onPress={handleAuth}
                disabled={isLoading}
                className="mt-2 h-12 flex-row items-center justify-center gap-2 rounded-xl bg-[#22C55E] active:bg-[#16A34A]"
                style={{ opacity: isLoading ? 0.6 : 1 }}
              >
                {isLoading ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <>
                    <Text className="text-[14px] font-bold text-white">Se connecter</Text>
                    <ArrowRight size={16} color="#ffffff" />
                  </>
                )}
              </Pressable>
            </View>

            <View className="mt-8 border-t border-slate-100 pt-6 dark:border-slate-800">
              <Text className="text-center text-[13px] text-slate-500 dark:text-slate-400">
                Pas encore de salon sur Zyra ?{' '}
                <Text className="font-semibold text-emerald-600 dark:text-emerald-400">
                  Créer un compte
                </Text>
              </Text>
            </View>
          </View>

          <Text className="pt-6 text-center text-[11px] text-slate-400 dark:text-slate-600">
            © {new Date().getFullYear()} Zyra · Tous droits réservés
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
