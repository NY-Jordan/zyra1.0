import {
  Geist_400Regular,
  Geist_500Medium,
  Geist_600SemiBold,
  Geist_700Bold,
  Geist_800ExtraBold,
  useFonts,
} from '@expo-google-fonts/geist';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { Text, TextInput, useColorScheme } from 'react-native';

import { AnimatedSplashOverlay } from '@/components/animated-icon';

import '@/global.css';

SplashScreen.preventAutoHideAsync();

const anyText = Text as unknown as { defaultProps?: { style?: unknown } };
const anyTextInput = TextInput as unknown as { defaultProps?: { style?: unknown } };
anyText.defaultProps = anyText.defaultProps || {};
anyText.defaultProps.style = [{ fontFamily: 'Geist_400Regular' }, anyText.defaultProps.style];
anyTextInput.defaultProps = anyTextInput.defaultProps || {};
anyTextInput.defaultProps.style = [{ fontFamily: 'Geist_400Regular' }, anyTextInput.defaultProps.style];

export default function RootLayout() {
  const colorScheme = useColorScheme();
  useFonts({
    Geist_400Regular,
    Geist_500Medium,
    Geist_600SemiBold,
    Geist_700Bold,
    Geist_800ExtraBold,
  });

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AnimatedSplashOverlay />
      <Stack initialRouteName="login" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="login" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="orders" options={{ headerShown: true, title: 'Commandes' }} />
        <Stack.Screen name="hairdressers" options={{ headerShown: true, title: 'Coiffeurs' }} />
        <Stack.Screen name="activities" options={{ headerShown: true, title: 'Activités' }} />
        <Stack.Screen name="analytics" options={{ headerShown: true, title: 'Statistiques' }} />
        <Stack.Screen name="administration" options={{ headerShown: true, title: 'Administration' }} />
        <Stack.Screen name="settings" options={{ headerShown: true, title: 'Paramètres du salon' }} />
        <Stack.Screen name="profile" options={{ headerShown: true, title: 'Profil' }} />
      </Stack>
    </ThemeProvider>
  );
}
