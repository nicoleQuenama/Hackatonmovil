import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SeveridadType } from '../constants/Colors';

interface SeverityBadgeProps {
  severidad: SeveridadType;
  size?: 'sm' | 'md' | 'lg';
}

const SEVERITY_CONFIG: Record<
  SeveridadType,
  { label: string; backgroundColor: string; textColor: string }
> = {
  critica: {
    label: 'CRÍTICA',
    backgroundColor: '#D32F2F',
    textColor: '#FFFFFF',
  },
  alta: {
    label: 'ALTA',
    backgroundColor: '#F57C00',
    textColor: '#FFFFFF',
  },
  media: {
    label: 'MEDIA',
    backgroundColor: '#FBC02D',
    textColor: '#212121',
  },
  baja: {
    label: 'BAJA',
    backgroundColor: '#388E3C',
    textColor: '#FFFFFF',
  },
};

const SeverityBadge: React.FC<SeverityBadgeProps> = ({ severidad, size = 'md' }) => {
  const config = SEVERITY_CONFIG[severidad] ?? SEVERITY_CONFIG.baja;

  const sizeStyles = {
    sm: { paddingHorizontal: 5, paddingVertical: 2, fontSize: 9 },
    md: { paddingHorizontal: 8, paddingVertical: 3, fontSize: 11 },
    lg: { paddingHorizontal: 12, paddingVertical: 5, fontSize: 13 },
  }[size];

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: config.backgroundColor,
          paddingHorizontal: sizeStyles.paddingHorizontal,
          paddingVertical: sizeStyles.paddingVertical,
        },
      ]}
      accessibilityLabel={`Severidad ${config.label}`}
    >
      <Text
        style={[
          styles.text,
          { color: config.textColor, fontSize: sizeStyles.fontSize },
        ]}
      >
        {config.label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  text: {
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});

export default SeverityBadge;
