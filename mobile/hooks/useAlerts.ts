import { useState, useEffect, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import AlertsService, { Alert } from '../services/alerts.service';
import NotificationsService from '../services/notifications.service';
import { Config } from '../constants/Config';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface UseAlertsReturn {
  alerts: Alert[];
  activeAlerts: Alert[];
  isLoading: boolean;
  error: string | null;
  isConnected: boolean;
  refresh: () => Promise<void>;
  updateStatus: (id: string, estado: 'activa' | 'atendida' | 'cerrada') => Promise<void>;
}

export function useAlerts(): UseAlertsReturn {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  const fetchAlerts = useCallback(async () => {
    try {
      setError(null);
      const data = await AlertsService.getAlerts();
      setAlerts(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error cargando alertas';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Setup socket.io for real-time updates
  useEffect(() => {
    let mounted = true;

    const initSocket = async () => {
      try {
        const token = await AsyncStorage.getItem(Config.STORAGE_KEYS.AUTH_TOKEN);

        const socket = io(Config.SOCKET_URL, {
          transports: ['websocket', 'polling'],
          auth: token ? { token } : undefined,
          reconnection: true,
          reconnectionAttempts: 5,
          reconnectionDelay: 2000,
        });

        socketRef.current = socket;

        socket.on('connect', () => {
          if (mounted) setIsConnected(true);
        });

        socket.on('disconnect', () => {
          if (mounted) setIsConnected(false);
        });

        // New alert event
        socket.on('nueva_alerta', (newAlert: Alert) => {
          if (!mounted) return;
          setAlerts((prev) => [newAlert, ...prev]);

          // Show local notification
          NotificationsService.scheduleLocalNotification(
            `🔥 Nueva alerta - ${newAlert.zona}`,
            `Severidad: ${newAlert.severidad.toUpperCase()} | ${newAlert.descripcion}`,
            {
              alertId: newAlert.id,
              zona: newAlert.zona,
              severidad: newAlert.severidad,
            }
          ).catch(console.warn);
        });

        // Alert updated event
        socket.on('alerta_actualizada', (updatedAlert: Alert) => {
          if (!mounted) return;
          setAlerts((prev) =>
            prev.map((a) => (a.id === updatedAlert.id ? updatedAlert : a))
          );
        });
      } catch (err) {
        console.warn('Error inicializando socket:', err);
      }
    };

    // Initial fetch
    fetchAlerts();
    initSocket();

    return () => {
      mounted = false;
      socketRef.current?.disconnect();
      socketRef.current = null;
    };
  }, [fetchAlerts]);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    await fetchAlerts();
  }, [fetchAlerts]);

  const updateStatus = useCallback(
    async (id: string, estado: 'activa' | 'atendida' | 'cerrada') => {
      const updated = await AlertsService.updateAlertStatus(id, estado);
      setAlerts((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
    },
    []
  );

  const activeAlerts = alerts.filter((a) => a.estado === 'activa');

  return {
    alerts,
    activeAlerts,
    isLoading,
    error,
    isConnected,
    refresh,
    updateStatus,
  };
}
