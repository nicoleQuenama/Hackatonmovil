import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export interface NotificationData {
  alertId?: string;
  zona?: string;
  severidad?: string;
  [key: string]: unknown;
}

export const NotificationsService = {
  async registerForPushNotifications(): Promise<string | null> {
    if (!Device.isDevice) {
      console.warn('Las notificaciones push solo funcionan en dispositivos físicos');
      return null;
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.warn('Permisos de notificaciones denegados');
      return null;
    }

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'Alertas FireGuard',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#D32F2F',
        sound: 'default',
      });

      await Notifications.setNotificationChannelAsync('alertas_criticas', {
        name: 'Alertas Críticas',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 500, 200, 500],
        lightColor: '#D32F2F',
        sound: 'default',
        bypassDnd: true,
      });
    }

    try {
      const token = await Notifications.getExpoPushTokenAsync();
      return token.data;
    } catch (error) {
      console.warn('Error obteniendo push token:', error);
      return null;
    }
  },

  async scheduleLocalNotification(
    title: string,
    body: string,
    data?: NotificationData
  ): Promise<string> {
    const channelId = data?.severidad === 'critica' ? 'alertas_criticas' : 'default';

    return await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data: data ?? {},
        sound: 'default',
        ...(Platform.OS === 'android' && { channelId }),
      },
      trigger: null, // immediate
    });
  },

  setupNotificationHandlers(
    onReceive?: (notification: Notifications.Notification) => void,
    onResponse?: (response: Notifications.NotificationResponse) => void
  ): () => void {
    const receiveSubscription = Notifications.addNotificationReceivedListener(
      (notification) => {
        onReceive?.(notification);
      }
    );

    const responseSubscription = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        onResponse?.(response);
      }
    );

    // Return cleanup function
    return () => {
      receiveSubscription.remove();
      responseSubscription.remove();
    };
  },
};

export default NotificationsService;
