import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  Modal,
} from 'react-native';
import MapView, { Marker, Circle, Callout, Region } from 'react-native-maps';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAlerts } from '../../hooks/useAlerts';
import { Colors } from '../../constants/Colors';
import SeverityBadge from '../../components/SeverityBadge';
import { Alert } from '../../services/alerts.service';
import { COCHABAMBA_CENTER, COCHABAMBA_ZONES } from '../../constants/Config';
import { SeveridadType } from '../../constants/Colors';

const SEVERITY_COLORS: Record<SeveridadType, string> = {
  critica: Colors.primaryRed,
  alta: Colors.alertOrange,
  media: Colors.warningYellow,
  baja: Colors.safeGreen,
};

const LEGEND_ITEMS: { severidad: SeveridadType; label: string }[] = [
  { severidad: 'critica', label: 'Crítica' },
  { severidad: 'alta', label: 'Alta' },
  { severidad: 'media', label: 'Media' },
  { severidad: 'baja', label: 'Baja' },
];

export default function MapaScreen() {
  const router = useRouter();
  const { activeAlerts } = useAlerts();
  const mapRef = useRef<MapView>(null);
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);

  const handleMarkerPress = useCallback((alert: Alert) => {
    setSelectedAlert(alert);
  }, []);

  const handleNavigateToDetail = useCallback(() => {
    if (selectedAlert) {
      setSelectedAlert(null);
      router.push({ pathname: '/alert-detail', params: { id: selectedAlert.id } });
    }
  }, [selectedAlert, router]);

  const handleCenterMap = useCallback(() => {
    mapRef.current?.animateToRegion(COCHABAMBA_CENTER, 800);
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Full screen map */}
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={COCHABAMBA_CENTER}
        mapType="standard"
        showsUserLocation
        showsMyLocationButton={false}
        showsCompass
        showsScale
        onPress={() => setSelectedAlert(null)}
        accessibilityLabel="Mapa de alertas de Cochabamba"
      >
        {/* Zone overlay circles for Parque Tunari */}
        {COCHABAMBA_ZONES.map((zone) => (
          <Circle
            key={zone.id}
            center={{ latitude: zone.lat, longitude: zone.lng }}
            radius={zone.radio}
            fillColor="rgba(211, 47, 47, 0.06)"
            strokeColor="rgba(211, 47, 47, 0.25)"
            strokeWidth={1.5}
          />
        ))}

        {/* Alert markers */}
        {activeAlerts.map((alert) => {
          const markerColor = SEVERITY_COLORS[alert.severidad] ?? Colors.primaryRed;
          return (
            <Marker
              key={alert.id}
              coordinate={{ latitude: alert.lat, longitude: alert.lng }}
              pinColor={markerColor}
              onPress={() => handleMarkerPress(alert)}
              accessibilityLabel={`Alerta en ${alert.zona}, severidad ${alert.severidad}`}
            />
          );
        })}
      </MapView>

      {/* Header overlay */}
      <View style={styles.headerOverlay}>
        <View style={styles.headerCard}>
          <Text style={styles.headerTitle}>Mapa de Alertas</Text>
          <Text style={styles.headerSubtitle}>
            {activeAlerts.length} alerta{activeAlerts.length !== 1 ? 's' : ''} activa{activeAlerts.length !== 1 ? 's' : ''}
          </Text>
        </View>
      </View>

      {/* Center button */}
      <TouchableOpacity
        style={styles.centerButton}
        onPress={handleCenterMap}
        accessibilityRole="button"
        accessibilityLabel="Centrar mapa en Cochabamba"
      >
        <Ionicons name="locate" size={22} color={Colors.primaryRed} />
      </TouchableOpacity>

      {/* Legend */}
      <View style={styles.legend}>
        {LEGEND_ITEMS.map((item) => (
          <View key={item.severidad} style={styles.legendItem}>
            <View
              style={[styles.legendDot, { backgroundColor: SEVERITY_COLORS[item.severidad] }]}
            />
            <Text style={styles.legendText}>{item.label}</Text>
          </View>
        ))}
      </View>

      {/* Selected alert mini-card */}
      {selectedAlert ? (
        <View style={styles.alertCard}>
          <View style={styles.alertCardHeader}>
            <View style={styles.alertCardInfo}>
              <Text style={styles.alertCardZona} numberOfLines={1}>
                {selectedAlert.zona}
              </Text>
              <SeverityBadge severidad={selectedAlert.severidad} size="sm" />
            </View>
            <TouchableOpacity
              onPress={() => setSelectedAlert(null)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="close" size={20} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>
          <Text style={styles.alertCardTipo}>{selectedAlert.tipo}</Text>
          <Text style={styles.alertCardCoords}>
            {selectedAlert.lat.toFixed(4)}, {selectedAlert.lng.toFixed(4)}
          </Text>
          <TouchableOpacity
            style={styles.alertCardButton}
            onPress={handleNavigateToDetail}
            accessibilityRole="button"
            accessibilityLabel="Ver detalle de alerta"
          >
            <Text style={styles.alertCardButtonText}>Ver Detalle</Text>
            <Ionicons name="arrow-forward" size={16} color={Colors.white} />
          </TouchableOpacity>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  headerOverlay: {
    position: 'absolute',
    top: 48,
    left: 16,
    right: 16,
  },
  headerCard: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  headerSubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  centerButton: {
    position: 'absolute',
    right: 16,
    top: 130,
    backgroundColor: Colors.surface,
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  legend: {
    position: 'absolute',
    bottom: 180,
    left: 16,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 10,
    padding: 10,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    gap: 4,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  alertCard: {
    position: 'absolute',
    bottom: 90,
    left: 16,
    right: 16,
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 16,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  alertCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  alertCardInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginRight: 8,
  },
  alertCardZona: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.textPrimary,
    flex: 1,
  },
  alertCardTipo: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  alertCardCoords: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontFamily: 'monospace',
    marginBottom: 12,
  },
  alertCardButton: {
    backgroundColor: Colors.primaryRed,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 8,
    paddingVertical: 12,
  },
  alertCardButtonText: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: '700',
  },
});
