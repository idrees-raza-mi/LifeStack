import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { PaperProvider, MD3LightTheme } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useAuthStore } from '../src/store/authStore';
import { Colors } from '../src/constants';

const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: Colors.primary,
    primaryContainer: Colors.lavenderLight,
    onPrimaryContainer: Colors.primaryDark,
    secondary: Colors.secondary,
    secondaryContainer: Colors.skyBlueLight,
    onSecondaryContainer: Colors.secondaryDark,
    tertiary: Colors.accent,
    tertiaryContainer: Colors.roseLight,
    onTertiaryContainer: Colors.accent,
    error: Colors.error,
    errorContainer: Colors.accentLight,
    onErrorContainer: Colors.errorDark,
    background: Colors.background,
    onBackground: Colors.text,
    surface: Colors.surface,
    onSurface: Colors.text,
    surfaceVariant: Colors.lavenderLight,
    onSurfaceVariant: Colors.textSecondary,
    outline: Colors.cardBorder,
    outlineVariant: Colors.lavenderLight,
    shadow: Colors.shadow,
    inverseSurface: Colors.text,
    inverseOnSurface: Colors.white,
    inversePrimary: Colors.primaryLight,
    elevation: {
      ...MD3LightTheme.colors.elevation,
      level0: Colors.background,
      level1: Colors.surface,
      level2: Colors.surfaceElevated,
      level3: Colors.surfaceElevated,
      level4: Colors.surfaceElevated,
      level5: Colors.surfaceElevated,
    },
    surfaceDisabled: Colors.lavenderLight,
    onSurfaceDisabled: Colors.textTertiary,
    backdrop: Colors.overlay,
  },
  roundness: 24,
};

export default function RootLayout() {
  const { checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <SafeAreaProvider>
      <PaperProvider theme={theme}>
        <StatusBar style="dark" backgroundColor={Colors.background} />
        <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(tabs)" />
        </Stack>
      </PaperProvider>
    </SafeAreaProvider>
  );
}
