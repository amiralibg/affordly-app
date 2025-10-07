import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { QueryClientProvider } from '@tanstack/react-query';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { queryClient } from '@/lib/queryClient';
import { useEffect } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { ThemeProvider, useTheme } from '@/contexts/ThemeContext';
import { I18nextProvider } from 'react-i18next';
import i18n from '@/i18n';
import { I18nManager } from 'react-native';
import {
  useFonts,
  Vazirmatn_400Regular,
  Vazirmatn_700Bold,
} from '@expo-google-fonts/vazirmatn';
import {
  Poppins_400Regular,
  Poppins_700Bold,
} from '@expo-google-fonts/poppins';
import * as SplashScreen from 'expo-splash-screen';
import Toast from 'react-native-toast-message';
import { toastConfig } from '@/lib/toast';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

function RootLayoutContent() {
  useFrameworkReady();
  const checkAuth = useAuthStore((state) => state.checkAuth);
  const { theme } = useTheme();

  const [fontsLoaded] = useFonts({
    Vazirmatn_400Regular,
    Vazirmatn_700Bold,
    Poppins_400Regular,
    Poppins_700Bold,
  });

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    // Update RTL based on language on app start
    const isRTL = i18n.language === 'fa';
    console.log('language', i18n.language);
    console.log('Setting RTL to', isRTL);
    I18nManager.allowRTL(isRTL);
    I18nManager.forceRTL(isRTL);
  }, []);

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style={theme.isDark ? 'light' : 'dark'} />
      <Toast config={toastConfig} />
    </>
  );
}

export default function RootLayout() {
  return (
    <I18nextProvider i18n={i18n}>
      <ThemeProvider>
        <QueryClientProvider client={queryClient}>
          <RootLayoutContent />
        </QueryClientProvider>
      </ThemeProvider>
    </I18nextProvider>
  );
}
