import { useFonts } from "expo-font";

import {
  Geist_400Regular,
  Geist_500Medium,
  Geist_600SemiBold,
  Geist_700Bold,
  Geist_800ExtraBold,
} from '@expo-google-fonts/geist';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { Text, TextInput, useColorScheme } from 'react-native';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { AuthProvider } from '@/contexts/AuthContext';
import { useProtectedRoute } from '@/hooks/use-protected-route';

import '@/global.css';

SplashScreen.preventAutoHideAsync();

const anyText = Text as unknown as { defaultProps?: { style?: unknown } };
const anyTextInput = TextInput as unknown as { defaultProps?: { style?: unknown } };
anyText.defaultProps = anyText.defaultProps || {};
anyText.defaultProps.style = [{ fontFamily: 'Geist_400Regular' }, anyText.defaultProps.style];
anyTextInput.defaultProps = anyTextInput.defaultProps || {};
anyTextInput.defaultProps.style = [{ fontFamily: 'Geist_400Regular' }, anyTextInput.defaultProps.style];

function RootNavigator() {
  useFonts({
    Geist_400Regular,
    Geist_500Medium,
    Geist_600SemiBold,
    Geist_700Bold,
    Geist_800ExtraBold,
  });
  const colorScheme = useColorScheme();
  useProtectedRoute();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AnimatedSplashOverlay />
      <Stack initialRouteName="login" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="login" />
        <Stack.Screen name="setup" />
        <Stack.Screen name="change-password" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="services" options={{ headerShown: true, title: 'Services' }} />
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

export default function RootLayout() {
  

  return (
    <AuthProvider>
      <RootNavigator />
    </AuthProvider>
  );
}
