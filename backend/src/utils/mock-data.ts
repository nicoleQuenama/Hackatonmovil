import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { User } from '../models/user.model';
import { Alert } from '../models/alert.model';

// Pre-hashed passwords (password123 for all seed users)
const SALT_ROUNDS = 10;

function hashSync(plain: string): string {
  return bcrypt.hashSync(plain, SALT_ROUNDS);
}

export const mockUsers: User[] = [
  {
    id: uuidv4(),
    nombre: 'Carlos',
    apellido: 'Mamani',
    email: 'carlos.mamani@bomberos-cbba.bo',
    passwordHash: hashSync('password123'),
    rol: 'jefe',
    unidad: 'Unidad Central Cochabamba',
    activo: true,
    fechaCreacion: '2023-01-15T08:00:00.000Z',
  },
  {
    id: uuidv4(),
    nombre: 'Ana',
    apellido: 'Flores',
    email: 'ana.flores@bomberos-cbba.bo',
    passwordHash: hashSync('password123'),
    rol: 'bombero',
    unidad: 'Unidad Norte - Sacaba',
    activo: true,
    fechaCreacion: '2023-03-20T08:00:00.000Z',
  },
  {
    id: uuidv4(),
    nombre: 'Roberto',
    apellido: 'Vargas',
    email: 'admin@fireguard.bo',
    passwordHash: hashSync('admin2024'),
    rol: 'admin',
    unidad: 'Administración Central',
    activo: true,
    fechaCreacion: '2022-11-10T08:00:00.000Z',
  },
];

export const mockAlerts: Alert[] = [
  {
    id: uuidv4(),
    tipo: 'incendio_forestal',
    severidad: 'critica',
    lat: -17.28,
    lng: -66.21,
    zona: 'Parque Tunari',
    descripcion:
      'Incendio detectado por sistema VIIR en zona boscosa del Parque Tunari. Focos activos confirmados con alta temperatura superficial.',
    vientoVelocidad: 22,
    vientoDireccion: 220,
    temperatura: 38,
    humedad: 18,
    estado: 'activa',
    origen: 'viir',
    timestamp: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
    bomberosAsignados: [],
  },
  {
    id: uuidv4(),
    tipo: 'incendio_forestal',
    severidad: 'alta',
    lat: -17.275,
    lng: -66.205,
    zona: 'Parque Tunari',
    descripcion:
      'Anomalía térmica detectada por MOVIS en sector noreste del Parque Tunari. NDVI reducido indica vegetación seca propensa a propagación.',
    vientoVelocidad: 18,
    vientoDireccion: 235,
    temperatura: 35,
    humedad: 22,
    estado: 'activa',
    origen: 'movis',
    timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    bomberosAsignados: [],
  },
  {
    id: uuidv4(),
    tipo: 'incendio_urbano_periurbano',
    severidad: 'media',
    lat: -17.395,
    lng: -66.045,
    zona: 'Sacaba',
    descripcion:
      'Quema agrícola no autorizada en zona periurbana de Sacaba detectada por modelo IA. Riesgo de propagación a zonas residenciales.',
    vientoVelocidad: 14,
    vientoDireccion: 200,
    temperatura: 29,
    humedad: 35,
    estado: 'atendida',
    origen: 'modelo_ia',
    timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    bomberosAsignados: [],
  },
  {
    id: uuidv4(),
    tipo: 'incendio_forestal',
    severidad: 'alta',
    lat: -17.395,
    lng: -66.36,
    zona: 'Quillacollo',
    descripcion:
      'Incendio en ladera este del municipio de Quillacollo. Vientos de componente sur favorecen propagación hacia zona habitada.',
    vientoVelocidad: 25,
    vientoDireccion: 185,
    temperatura: 33,
    humedad: 20,
    estado: 'activa',
    origen: 'viir',
    timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    bomberosAsignados: [],
  },
  {
    id: uuidv4(),
    tipo: 'quema_agricola',
    severidad: 'baja',
    lat: -17.39,
    lng: -66.155,
    zona: 'Cercado',
    descripcion:
      'Quema controlada registrada en área agrícola sur de Cercado. Sin riesgo inmediato, monitoreo preventivo activado por sistema MOVIS.',
    vientoVelocidad: 10,
    vientoDireccion: 260,
    temperatura: 27,
    humedad: 42,
    estado: 'cerrada',
    origen: 'movis',
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    bomberosAsignados: [],
  },
];
