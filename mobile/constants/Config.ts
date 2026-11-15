// FireGuard Cochabamba - App Configuration

export const Config = {
  // Backend API URL
  API_BASE_URL: 'http://localhost:3000',
  SOCKET_URL: 'http://localhost:3000',

  // AsyncStorage keys
  STORAGE_KEYS: {
    AUTH_TOKEN: 'auth_token',
    USER_DATA: 'user_data',
  },

  // App info
  APP_VERSION: '1.0.0',
  APP_NAME: 'FireGuard Cochabamba',

  // Request timeout (ms)
  REQUEST_TIMEOUT: 10000,
} as const;

// Cochabamba zones with geographic coordinates
export const COCHABAMBA_ZONES = [
  {
    id: 'parque_tunari',
    nombre: 'Parque Nacional Tunari',
    lat: -17.2800,
    lng: -66.2100,
    radio: 5000, // metros
    descripcion: 'Área protegida con alta vegetación, riesgo crítico de incendios',
  },
  {
    id: 'sacaba',
    nombre: 'Sacaba',
    lat: -17.3950,
    lng: -66.0450,
    radio: 3000,
    descripcion: 'Zona periurbana con vegetación mixta',
  },
  {
    id: 'quillacollo',
    nombre: 'Quillacollo',
    lat: -17.3950,
    lng: -66.3600,
    radio: 3000,
    descripcion: 'Zona oeste con riesgo de incendio estacional',
  },
  {
    id: 'cercado',
    nombre: 'Cercado (Centro)',
    lat: -17.3833,
    lng: -66.1667,
    radio: 2000,
    descripcion: 'Área urbana central de Cochabamba',
  },
  {
    id: 'colcapirhua',
    nombre: 'Colcapirhua',
    lat: -17.3800,
    lng: -66.2500,
    radio: 2000,
    descripcion: 'Zona industrial con riesgo moderado',
  },
  {
    id: 'tiquipaya',
    nombre: 'Tiquipaya',
    lat: -17.3333,
    lng: -66.2167,
    radio: 2500,
    descripcion: 'Zona norte limítrofe con el Parque Tunari',
  },
] as const;

// Center of Cochabamba for initial map view
export const COCHABAMBA_CENTER = {
  latitude: -17.3833,
  longitude: -66.1667,
  latitudeDelta: 0.15,
  longitudeDelta: 0.15,
};

// Cardinal directions in Spanish
export const CARDINAL_DIRECTIONS = ['N', 'NE', 'E', 'SE', 'S', 'SO', 'O', 'NO'] as const;

export function getCardinalDirection(degrees: number): string {
  const index = Math.round(degrees / 45) % 8;
  return CARDINAL_DIRECTIONS[index];
}
