import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import { getCardinalDirection } from '../constants/Config';

interface WindInfoProps {
  velocidad: number; // km/h
  direccion: number; // degrees 0-360
  compact?: boolean;
}

const WindInfo: React.FC<WindInfoProps> = ({ velocidad, direccion, compact = false }) => {
  const cardinal = getCardinalDirection(direccion);
  // Rotate the arrow icon to match wind direction
  const arrowRotation = `${direccion}deg`;

  if (compact) {
    return (
      <View style={styles.compactContainer}>
        <Ionicons name="navigate" size={12} color={Colors.textSecondary} style={{ transform: [{ rotate: arrowRotation }] }} />
        <Text style={styles.compactText}>
          {velocidad} km/h {cardinal}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.iconRow}>
        <Ionicons name="navigate" size={20} color={Colors.primaryRed} style={{ transform: [{ rotate: arrowRotation }] }} />
        <Text style={styles.velocidadText}>{velocidad} km/h</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Dirección: </Text>
        <Text style={styles.value}>
          {direccion}° {cardinal}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
  },
  iconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  velocidadText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  label: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  value: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  compactText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
});

export default WindInfo;
