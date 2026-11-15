import { useState, useEffect, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { Config } from '../constants/Config';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface UseSocketReturn {
  socket: Socket | null;
  isConnected: boolean;
  connectionError: string | null;
}

export function useSocket(): UseSocketReturn {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);

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
          timeout: 10000,
        });

        socketRef.current = socket;

        socket.on('connect', () => {
          if (mounted) {
            setIsConnected(true);
            setConnectionError(null);
          }
        });

        socket.on('disconnect', () => {
          if (mounted) setIsConnected(false);
        });

        socket.on('connect_error', (err) => {
          if (mounted) {
            setIsConnected(false);
            setConnectionError(err.message);
          }
        });
      } catch (err) {
        if (mounted) {
          setConnectionError('Error inicializando conexión');
        }
      }
    };

    initSocket();

    return () => {
      mounted = false;
      socketRef.current?.disconnect();
      socketRef.current = null;
    };
  }, []);

  return {
    socket: socketRef.current,
    isConnected,
    connectionError,
  };
}
