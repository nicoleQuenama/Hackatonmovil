import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors } from '../constants/Colors';
import { Alert } from '../services/alerts.service';
import SeverityBadge from './SeverityBadge';
import WindInfo from './WindInfo';
import { getCardinalDirection } from '../constants/Config';

interface AlertCardProps {
  alert: Alert;
  onPress: (alert: Alert) => void;
}

function timeAgo(timestamp: string): string {
  const now = new Date();
  const then = new Date(timestamp);
  const diffMs = now.getTime() - then.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return 'Ahora mismo';
  if (diffMins < 60) return `Hace ${diffMins} min`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `Hace ${diffHours} h`;
  const diffDays = Math.floor(diffHours / 24);
  return `Hace ${diffDays} día${diffDays > 1 ? 's' : ''}`;
}

function origenLabel(origen: string): string {
  const labels: Record<string, string> = {
    movis: 'MOVIS',
    viir: 'VIIR',
    modelo_ia: 'IA',
  };
  return labels[origen] ?? origen.toUpperCase();
}

const severityBorderColor: Record<string, string> = {
  critica: Colors.primaryRed,
  alta: Colors.alertOrange,
  media: Colors.warningYellow,
  baja: Colors.safeGreen,
};

const AlertCard: React.FC<AlertCardProps> = ({ alert, onPress }) => {
  const borderColor = severityBorderColor[alert.severidad] ?? Colors.border;

  return (
    <TouchableOpacity
      style={[styles.card, { borderLeftColor: borderColor }]}
      onPress={() => onPress(alert)}
      activeOpacity={0.75}
      accessibilityRole="button"
      accessibilityLabel={`Alerta en ${alert.zona}, severidad ${alert.severidad}`}
      testID={`alert-card-${alert.id}`}
    >
      <View style={styles.header}>
        <Text style={styles.zona} numberOfLines={1}>
          {alert.zona}
        </Text>
        <SeverityBadge severidad={alert.severidad} />
      </View>

      <Text style={styles.tipo} numberOfLines={1}>
        {alert.tipo}
      </Text>

      <View style={styles.footer}>
        <View style={styles.footerLeft}>
          <WindInfo
            velocidad={alert.vientoVelocidad}
            direccion={alert.vientoDireccion}
            compact
          />
        </View>

        <View style={styles.footerRight}>
          <View style={[styles.origenBadge]}>
            <Text style={styles.origenText}>{origenLabel(alert.origen)}</Text>
          </View>
          <Text style={styles.time}>{timeAgo(alert.timestamp)}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 8,
    borderLeftWidth: 5,
    marginVertical: 4,
    marginHorizontal: 12,
    padding: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  zona: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginRight: 8,
  },
  tipo: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerLeft: {
    flex: 1,
  },
  footerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  origenBadge: {
    backgroundColor: Colors.darkBackground,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  origenText: {
    color: Colors.white,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  time: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
});

export default AlertCard;
