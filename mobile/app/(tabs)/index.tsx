import React, { useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../hooks/useAuth';
import { useAlerts } from '../../hooks/useAlerts';
import { Colors } from '../../constants/Colors';
import SeverityBadge from '../../components/SeverityBadge';
import { Alert } from '../../services/alerts.service';
import { SeveridadType } from '../../constants/Colors';

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Buenos días';
  if (hour < 19) return 'Buenas tardes';
  return 'Buenas noches';
}

function formatDate(): string {
  return new Date().toLocaleDateString('es-BO', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function timeAgo(timestamp: string): string {
  const diffMs = Date.now() - new Date(timestamp).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'Ahora';
  if (mins < 60) return `${mins} min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  return `${Math.floor(hours / 24)}d`;
}

interface SummaryCardProps {
  label: string;
  count: number;
  color: string;
  bgColor: string;
  icon: keyof typeof Ionicons.glyphMap;
}

function SummaryCard({ label, count, color, bgColor, icon }: SummaryCardProps) {
  return (
    <View style={[styles.summaryCard, { backgroundColor: bgColor }]}>
      <Ionicons name={icon} size={22} color={color} />
      <Text style={[styles.summaryCount, { color }]}>{count}</Text>
      <Text style={styles.summaryLabel}>{label}</Text>
    </View>
  );
}

export default function DashboardScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { alerts, activeAlerts, isLoading, refresh } = useAlerts();

  const criticas = activeAlerts.filter((a) => a.severidad === 'critica').length;
  const altas = activeAlerts.filter((a) => a.severidad === 'alta').length;
  const medias = activeAlerts.filter((a) => a.severidad === 'media').length;
  const totalActive = activeAlerts.length;

  const recentAlerts = [...alerts]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 3);

  const handleAlertPress = useCallback(
    (alert: Alert) => {
      router.push({ pathname: '/alert-detail', params: { id: alert.id } });
    },
    [router]
  );

  const handleVerActiva = useCallback(() => {
    if (activeAlerts.length > 0) {
      router.push({ pathname: '/alert-detail', params: { id: activeAlerts[0].id } });
    } else {
      router.push('/(tabs)/alertas');
    }
  }, [activeAlerts, router]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primaryRed} />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>
            {getGreeting()}, {user?.nombre ?? 'Bombero'}
          </Text>
          <Text style={styles.date}>{formatDate()}</Text>
        </View>
        <View style={styles.headerIcon}>
          <Text style={styles.fireEmoji}>🔥</Text>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={refresh}
            colors={[Colors.primaryRed]}
            tintColor={Colors.primaryRed}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Summary cards */}
        <Text style={styles.sectionTitle}>Resumen de Alertas</Text>
        <View style={styles.summaryRow}>
          <SummaryCard
            label="Críticas"
            count={criticas}
            color={Colors.primaryRed}
            bgColor="#FFEBEE"
            icon="flame"
          />
          <SummaryCard
            label="Altas"
            count={altas}
            color={Colors.alertOrange}
            bgColor="#FFF3E0"
            icon="warning"
          />
          <SummaryCard
            label="Medias"
            count={medias}
            color={Colors.warningYellowDark}
            bgColor="#FFFDE7"
            icon="alert-circle"
          />
          <SummaryCard
            label="Total"
            count={totalActive}
            color={Colors.primaryRed}
            bgColor="#FCE4EC"
            icon="notifications"
          />
        </View>

        {/* Quick action */}
        <TouchableOpacity
          style={styles.quickActionButton}
          onPress={handleVerActiva}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel={`Ver alerta activa. ${totalActive} alertas activas`}
        >
          <Ionicons name="eye" size={20} color={Colors.white} />
          <Text style={styles.quickActionText}>
            Ver Alerta Activa {totalActive > 0 ? `(${totalActive})` : ''}
          </Text>
          <Ionicons name="chevron-forward" size={18} color={Colors.white} />
        </TouchableOpacity>

        {/* Recent alerts */}
        <Text style={styles.sectionTitle}>Alertas Recientes</Text>

        {recentAlerts.length === 0 ? (
          <View style={styles.emptyCard}>
            <Ionicons name="checkmark-circle" size={40} color={Colors.safeGreen} />
            <Text style={styles.emptyText}>Sin alertas recientes</Text>
          </View>
        ) : (
          recentAlerts.map((alert) => (
            <TouchableOpacity
              key={alert.id}
              style={styles.alertItem}
              onPress={() => handleAlertPress(alert)}
              activeOpacity={0.75}
              accessibilityRole="button"
              accessibilityLabel={`Alerta en ${alert.zona}, ${alert.severidad}`}
            >
              <View
                style={[
                  styles.alertItemBorder,
                  { backgroundColor: Colors.severity[alert.severidad as SeveridadType] },
                ]}
              />
              <View style={styles.alertItemContent}>
                <View style={styles.alertItemHeader}>
                  <Text style={styles.alertZona} numberOfLines={1}>
                    {alert.zona}
                  </Text>
                  <Text style={styles.alertTime}>{timeAgo(alert.timestamp)}</Text>
                </View>
                <View style={styles.alertItemFooter}>
                  <SeverityBadge severidad={alert.severidad} size="sm" />
                  <Text style={styles.alertTipo} numberOfLines={1}>
                    {alert.tipo}
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={18} color={Colors.textSecondary} />
            </TouchableOpacity>
          ))
        )}

        <TouchableOpacity
          style={styles.verTodasButton}
          onPress={() => router.push('/(tabs)/alertas')}
          accessibilityRole="button"
        >
          <Text style={styles.verTodasText}>Ver todas las alertas</Text>
          <Ionicons name="arrow-forward" size={16} color={Colors.primaryRed} />
        </TouchableOpacity>
      </ScrollView>
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
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.white,
  },
  date: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
    textTransform: 'capitalize',
  },
  headerIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fireEmoji: {
    fontSize: 24,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 10,
    marginTop: 4,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  summaryCard: {
    flex: 1,
    borderRadius: 10,
    padding: 10,
    alignItems: 'center',
    gap: 2,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
  },
  summaryCount: {
    fontSize: 22,
    fontWeight: '900',
    marginTop: 2,
  },
  summaryLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  quickActionButton: {
    backgroundColor: Colors.primaryRed,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    borderRadius: 10,
    paddingVertical: 16,
    marginBottom: 20,
    elevation: 3,
    shadowColor: Colors.primaryRed,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  quickActionText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '800',
    flex: 1,
    textAlign: 'center',
  },
  alertItem: {
    backgroundColor: Colors.surface,
    borderRadius: 8,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
  },
  alertItemBorder: {
    width: 5,
    alignSelf: 'stretch',
  },
  alertItemContent: {
    flex: 1,
    padding: 12,
  },
  alertItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  alertZona: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
    flex: 1,
  },
  alertTime: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginLeft: 8,
  },
  alertItemFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  alertTipo: {
    fontSize: 12,
    color: Colors.textSecondary,
    flex: 1,
  },
  emptyCard: {
    backgroundColor: Colors.surface,
    borderRadius: 10,
    padding: 24,
    alignItems: 'center',
    gap: 8,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  verTodasButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 14,
    marginTop: 4,
  },
  verTodasText: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.primaryRed,
  },
});
