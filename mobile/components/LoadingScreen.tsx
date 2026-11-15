import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { Colors } from '../constants/Colors';

interface LoadingScreenProps {
  message?: string;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({
  message = 'Cargando...',
}) => {
  return (
    <View style={styles.container} accessibilityLiveRegion="polite">
      <View style={styles.logoContainer}>
        <Text style={styles.logoEmoji}>🔥</Text>
      </View>
      <Text style={styles.appName}>FireGuard</Text>
      <Text style={styles.subtitle}>Cochabamba</Text>
      <ActivityIndicator
        size="large"
        color={Colors.primaryRed}
        style={styles.spinner}
      />
      <Text style={styles.message}>{message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  logoContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: Colors.primaryRed,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    elevation: 4,
    shadowColor: Colors.primaryRed,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  logoEmoji: {
    fontSize: 48,
  },
  appName: {
    fontSize: 32,
    fontWeight: '900',
    color: Colors.primaryRed,
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 32,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  spinner: {
    marginBottom: 12,
  },
  message: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
});

export default LoadingScreen;
