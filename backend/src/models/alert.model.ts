export interface Alert {
  id: string;
  tipo: string;
  severidad: 'baja' | 'media' | 'alta' | 'critica';
  lat: number;
  lng: number;
  zona: string;
  descripcion: string;
  vientoVelocidad: number;
  vientoDireccion: number;
  temperatura: number;
  humedad: number;
  estado: 'activa' | 'atendida' | 'cerrada';
  origen: 'movis' | 'viir' | 'modelo_ia';
  timestamp: string;
  bomberosAsignados: string[];
}

export interface AlertCreateInput {
  tipo: string;
  severidad: 'baja' | 'media' | 'alta' | 'critica';
  lat: number;
  lng: number;
  zona: string;
  descripcion: string;
  vientoVelocidad?: number;
  vientoDireccion?: number;
  temperatura?: number;
  humedad?: number;
  origen: 'movis' | 'viir' | 'modelo_ia';
}

export interface AlertStatusUpdate {
  estado: 'activa' | 'atendida' | 'cerrada';
  bomberosAsignados?: string[];
}
