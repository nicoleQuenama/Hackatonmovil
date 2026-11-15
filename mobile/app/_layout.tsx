import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { useRouter, useSegments } from 'expo-router';
import { PaperProvider, MD3LightTheme } from 'react-native-paper';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider, useAuth } from '../hooks/useAuth';
import { Colors } from '../constants/Colors';
import LoadingScreen from '../components/LoadingScreen';
import ErrorBoundary from '../components/ErrorBoundary';

// Custom Material Design theme with FireGuard branding
const fireGuardTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: Colors.primaryRed,
    primaryContainer: '#FFEBEE',
    secondary: Colors.alertOrange,
    error: Colors.primaryRed,
    background: Colors.surfaceVariant,
    surface: Colors.surface,
    onPrimary: Colors.textOnPrimary,
    onBackground: Colors.textPrimary,
    onSurface: Colors.textPrimary,
  },
};

// Inner component that uses auth context
function RootLayoutNav() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!isAuthenticated && !inAuthGroup) {
      // Not authenticated – redirect to login
      router.replace('/(auth)/login');
    } else if (isAuthenticated && inAuthGroup) {
      // Authenticated – redirect to main app
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, isLoading, segments]);

  if (isLoading) {
    return <LoadingScreen message="Verificando sesión..." />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen
        name="alert-detail"
        options={{
          headerShown: true,
          headerTitle: 'Detalle de Alerta',
          headerStyle: { backgroundColor: Colors.primaryRed },
          headerTintColor: Colors.white,
          headerTitleStyle: { fontWeight: '700' },
          presentation: 'card',
        }}
      />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <PaperProvider theme={fireGuardTheme}>
          <StatusBar style="light" backgroundColor={Colors.primaryRed} />
          <RootLayoutNav />
        </PaperProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}
