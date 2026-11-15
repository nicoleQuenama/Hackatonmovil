import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Config } from '../constants/Config';

// Create Axios instance
const api = axios.create({
  baseURL: Config.API_BASE_URL,
  timeout: Config.REQUEST_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Request interceptor: attach JWT token from AsyncStorage
api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    try {
      const token = await AsyncStorage.getItem(Config.STORAGE_KEYS.AUTH_TOKEN);
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.warn('Error leyendo token de AsyncStorage:', error);
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor: handle common errors
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Token expired or invalid – clear stored credentials
      try {
        await AsyncStorage.multiRemove([
          Config.STORAGE_KEYS.AUTH_TOKEN,
          Config.STORAGE_KEYS.USER_DATA,
        ]);
      } catch (storageError) {
        console.warn('Error limpiando AsyncStorage:', storageError);
      }
    }

    const message =
      (error.response?.data as { message?: string })?.message ||
      error.message ||
      'Error de conexión';

    return Promise.reject(new Error(message));
  }
);

export default api;
