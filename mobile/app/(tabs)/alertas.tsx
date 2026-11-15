import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAlerts } from '../../hooks/useAlerts';
import { Colors } from '../../constants/Colors';
import AlertCard from '../../components/AlertCard';
import { Alert } from '../../services/alerts.service';

type FilterType = 'todas' | 'activas' | 'atendidas';

const FILTER_OPTIONS: { key: FilterType; label: string }[] = [
  { key: 'todas', label: 'Todas' },
  { key: 'activas', label: 'Activas' },
  { key: 'atendidas', label: 'Atendidas' },
];

export default function AlertasScreen() {
  const router = useRouter();
  const { alerts, isLoading, error, isConnected, refresh } = useAlerts();
  const [activeFilter, setActiveFilter] = useState<FilterType>('todas');

  const filteredAlerts = alerts.filter((a) => {
    if (activeFilter === 'todas') return true;
    if (activeFilter === 'activas') return a.estado === 'activa';
    if (activeFilter === 'atendidas') return a.estado === 'atendida';
    return true;
  });

  // Sort: active first, then by date desc
  const sortedAlerts = [...filteredAlerts].sort((a, b) => {
    if (a.estado === 'activa' && b.estado !== 'activa') return -1;
    if (a.estado !== 'activa' && b.estado === 'activa') return 1;
    return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
  });

  const handleAlertPress = useCallback(
    (alert: Alert) => {
      router.push({ pathname: '/alert-detail', params: { id: alert.id } });
    },
    [router]
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="notifications-off-outline" size={56} color={Colors.border} />
      <Text style={styles.emptyTitle}>Sin alertas</Text>
      <Text style={styles.emptySubtitle}>
        {activeFilter === 'activas'
          ? 'No hay alertas activas en este momento'
          : 'No se encontraron alertas con este filtro'}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primaryRed} />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Alertas</Text>
        <View style={styles.headerRight}>
          {isConnected ? (
            <View style={styles.connectedBadge}>
              <View style={styles.connectedDot} />
              <Text style={styles.connectedText}>En vivo</Text>
            </View>
          ) : (
            <View style={styles.disconnectedBadge}>
              <Ionicons name="wifi-outline" size={14} color={Colors.textSecondary} />
              <Text style={styles.disconnectedText}>Sin conexión</Text>
            </View>
          )}
        </View>
      </View>

      {/* Filter tabs */}
      <View style={styles.filterRow}>
        {FILTER_OPTIONS.map((option) => (
          <TouchableOpacity
            key={option.key}
            style={[
              styles.filterTab,
              activeFilter === option.key && styles.filterTabActive,
            ]}
            onPress={() => setActiveFilter(option.key)}
            accessibilityRole="tab"
            accessibilityState={{ selected: activeFilter === option.key }}
            accessibilityLabel={`Filtrar: ${option.label}`}
          >
            <Text
              style={[
                styles.filterTabText,
                activeFilter === option.key && styles.filterTabTextActive,
              ]}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {error ? (
        <View style={styles.errorBanner}>
          <Ionicons name="alert-circle" size={16} color={Colors.primaryRed} />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={refresh}>
            <Text style={styles.retryText}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      <FlatList
        data={sortedAlerts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <AlertCard alert={item} onPress={handleAlertPress} />
        )}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={refresh}
            colors={[Colors.primaryRed]}
            tintColor={Colors.primaryRed}
          />
        }
        contentContainerStyle={[
          styles.listContent,
          sortedAlerts.length === 0 && styles.listEmpty,
        ]}
        showsVerticalScrollIndicator={false}
        accessibilityLabel="Lista de alertas"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.surfaceVariant,
  },
  header: {
    backgroundColor: Colors.primaryRed,
    paddingTop: 52,
    paddingBottom: 16,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: Colors.white,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  connectedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 5,
  },
  connectedDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#76FF03',
  },
  connectedText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '600',
  },
  disconnectedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  disconnectedText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
  },
  filterRow: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.surfaceVariant,
    minHeight: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterTabActive: {
    backgroundColor: Colors.primaryRed,
  },
  filterTabText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  filterTabTextActive: {
    color: Colors.white,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFEBEE',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#FFCDD2',
  },
  errorText: {
    flex: 1,
    fontSize: 13,
    color: Colors.primaryRed,
  },
  retryText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primaryRed,
    textDecorationLine: 'underline',
  },
  listContent: {
    paddingVertical: 8,
  },
  listEmpty: {
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 24,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginTop: 12,
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
});
