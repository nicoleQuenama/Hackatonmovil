import AsyncStorage from '@react-native-async-storage/async-storage';
import api from './api';
import { Config } from '../constants/Config';

export interface User {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  rol: 'bombero' | 'jefe' | 'admin';
  unidad: string;
  activo: boolean;
  fechaCreacion: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export const AuthService = {
  async login(email: string, password: string): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>('/api/auth/login', {
      email: email.trim().toLowerCase(),
      password,
    });

    const { token, user } = response.data;

    // Store credentials
    await AsyncStorage.multiSet([
      [Config.STORAGE_KEYS.AUTH_TOKEN, token],
      [Config.STORAGE_KEYS.USER_DATA, JSON.stringify(user)],
    ]);

    return { token, user };
  },

  async logout(): Promise<void> {
    await AsyncStorage.multiRemove([
      Config.STORAGE_KEYS.AUTH_TOKEN,
      Config.STORAGE_KEYS.USER_DATA,
    ]);
  },

  async getCurrentUser(): Promise<User | null> {
    try {
      const userData = await AsyncStorage.getItem(Config.STORAGE_KEYS.USER_DATA);
      if (!userData) return null;
      return JSON.parse(userData) as User;
    } catch {
      return null;
    }
  },

  async isAuthenticated(): Promise<boolean> {
    try {
      const token = await AsyncStorage.getItem(Config.STORAGE_KEYS.AUTH_TOKEN);
      return !!token;
    } catch {
      return false;
    }
  },

  async getMe(): Promise<User> {
    const response = await api.get<User>('/api/auth/me');
    // Update stored user data
    await AsyncStorage.setItem(
      Config.STORAGE_KEYS.USER_DATA,
      JSON.stringify(response.data)
    );
    return response.data;
  },
};

export default AuthService;
