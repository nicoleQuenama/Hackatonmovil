import api from './api';
import { SeveridadType, OrigenType, EstadoType } from '../constants/Colors';

export interface Alert {
  id: string;
  tipo: string;
  severidad: SeveridadType;
  lat: number;
  lng: number;
  zona: string;
  descripcion: string;
  vientoVelocidad: number;
  vientoDireccion: number;
  temperatura: number;
  humedad: number;
  estado: EstadoType;
  origen: OrigenType;
  timestamp: string;
  bomberosAsignados: string[];
}

export interface AlertsQueryParams {
  zona?: string;
  estado?: EstadoType;
}

export const AlertsService = {
  async getAlerts(params?: AlertsQueryParams): Promise<Alert[]> {
    const response = await api.get<Alert[]>('/api/alerts', { params });
    return response.data;
  },

  async getAlertById(id: string): Promise<Alert> {
    const response = await api.get<Alert>(`/api/alerts/${id}`);
    return response.data;
  },

  async getActiveAlerts(): Promise<Alert[]> {
    const response = await api.get<Alert[]>('/api/alerts/active');
    return response.data;
  },

  async updateAlertStatus(id: string, estado: EstadoType): Promise<Alert> {
    const response = await api.patch<Alert>(`/api/alerts/${id}/estado`, { estado });
    return response.data;
  },
};

export default AlertsService;
