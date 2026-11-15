# 📡 FireGuard Cochabamba — API Documentation

**Base URL (desarrollo):** `http://localhost:3000`  
**Base URL (producción):** `https://api.fireguard-cbba.bo`  
**Content-Type:** `application/json`  
**Autenticación:** Bearer JWT (header `Authorization: Bearer <token>`)

---

## Tabla de Contenidos

1. [Autenticación](#autenticación)
2. [Alertas](#alertas)
3. [Clima](#clima)
4. [Integraciones](#integraciones)
5. [Socket.io Events](#socketio-events)
6. [Códigos de Error](#códigos-de-error)

---

## 1. Autenticación

### POST `/api/auth/login`

Autentica a un usuario y retorna un token JWT.

**Request:**
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@bomberos-cbba.bo",
  "password": "Admin123!"
}
```

**Response 200 OK:**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "u-001",
      "nombre": "Carlos",
      "apellido": "Mamani",
      "email": "admin@bomberos-cbba.bo",
      "rol": "admin",
      "unidad": "Central Cochabamba",
      "activo": true
    }
  }
}
```

**Response 401 Unauthorized:**
```json
{
  "success": false,
  "error": "Credenciales inválidas"
}
```

**Response 422 Validation Error:**
```json
{
  "success": false,
  "errors": [
    { "field": "email", "message": "Email inválido" },
    { "field": "password", "message": "La contraseña es requerida" }
  ]
}
```

---

### GET `/api/auth/me`

Retorna el perfil del usuario autenticado.

**Request:**
```http
GET /api/auth/me
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response 200 OK:**
```json
{
  "success": true,
  "data": {
    "id": "u-001",
    "nombre": "Carlos",
    "apellido": "Mamani",
    "email": "admin@bomberos-cbba.bo",
    "rol": "admin",
    "unidad": "Central Cochabamba",
    "activo": true,
    "fechaCreacion": "2024-01-15T10:00:00Z"
  }
}
```

**Response 401:**
```json
{
  "success": false,
  "error": "Token inválido o expirado"
}
```

---

## 2. Alertas

### GET `/api/alerts`

Lista todas las alertas con filtros opcionales.

**Query Parameters:**

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `zona` | string | Filtrar por zona (Parque Tunari, Sacaba, Quillacollo, Cercado) |
| `estado` | string | `activa`, `atendida`, `cerrada` |
| `severidad` | string | `baja`, `media`, `alta`, `critica` |
| `limit` | number | Máximo de resultados (default: 50) |

**Request:**
```http
GET /api/alerts?zona=Parque%20Tunari&estado=activa
```

**Response 200 OK:**
```json
{
  "success": true,
  "data": [
    {
      "id": "alert-001",
      "tipo": "incendio_forestal",
      "severidad": "critica",
      "lat": -17.2800,
      "lng": -66.2100,
      "zona": "Parque Tunari",
      "descripcion": "Foco de incendio detectado en ladera norte del Parque Tunari. Vientos fuertes del norte aceleran propagación.",
      "vientoVelocidad": 45,
      "vientoDireccion": 350,
      "temperatura": 32,
      "humedad": 18,
      "estado": "activa",
      "origen": "movis",
      "timestamp": "2024-11-15T14:30:00Z",
      "bomberosAsignados": ["u-002", "u-003"]
    }
  ],
  "total": 1
}
```

---

### GET `/api/alerts/active`

Retorna únicamente alertas con estado `activa`.

**Request:**
```http
GET /api/alerts/active
```

**Response 200 OK:**
```json
{
  "success": true,
  "data": [...],
  "total": 3
}
```

---

### GET `/api/alerts/:id`

Retorna el detalle completo de una alerta.

**Request:**
```http
GET /api/alerts/alert-001
```

**Response 200 OK:**
```json
{
  "success": true,
  "data": {
    "id": "alert-001",
    "tipo": "incendio_forestal",
    "severidad": "critica",
    "lat": -17.2800,
    "lng": -66.2100,
    "zona": "Parque Tunari",
    "descripcion": "Foco de incendio detectado en ladera norte del Parque Tunari.",
    "vientoVelocidad": 45,
    "vientoDireccion": 350,
    "temperatura": 32,
    "humedad": 18,
    "estado": "activa",
    "origen": "movis",
    "timestamp": "2024-11-15T14:30:00Z",
    "bomberosAsignados": ["u-002", "u-003"]
  }
}
```

**Response 404:**
```json
{
  "success": false,
  "error": "Alerta no encontrada"
}
```

---

### POST `/api/alerts`

Crea una nueva alerta. Requiere autenticación JWT.

**Request:**
```http
POST /api/alerts
Authorization: Bearer <token>
Content-Type: application/json

{
  "tipo": "incendio_forestal",
  "severidad": "alta",
  "lat": -17.3950,
  "lng": -66.0450,
  "zona": "Sacaba",
  "descripcion": "Columna de humo visible desde carretera Sacaba-Colomi.",
  "vientoVelocidad": 30,
  "vientoDireccion": 180,
  "temperatura": 28,
  "humedad": 22,
  "origen": "bombero"
}
```

**Response 201 Created:**
```json
{
  "success": true,
  "data": {
    "id": "alert-006",
    "tipo": "incendio_forestal",
    "severidad": "alta",
    "lat": -17.3950,
    "lng": -66.0450,
    "zona": "Sacaba",
    "descripcion": "Columna de humo visible desde carretera Sacaba-Colomi.",
    "vientoVelocidad": 30,
    "vientoDireccion": 180,
    "temperatura": 28,
    "humedad": 22,
    "estado": "activa",
    "origen": "bombero",
    "timestamp": "2024-11-15T15:00:00Z",
    "bomberosAsignados": []
  }
}
```

> **Nota:** Al crear una alerta, el servidor emite automáticamente el evento Socket.io `nueva_alerta` a todos los clientes conectados.

---

### PATCH `/api/alerts/:id/estado`

Actualiza el estado de una alerta. Requiere autenticación JWT.

**Request:**
```http
PATCH /api/alerts/alert-001/estado
Authorization: Bearer <token>
Content-Type: application/json

{
  "estado": "atendida"
}
```

**Estados válidos:** `activa` | `atendida` | `cerrada`

**Response 200 OK:**
```json
{
  "success": true,
  "data": {
    "id": "alert-001",
    "estado": "atendida",
    ...
  }
}
```

> **Nota:** Al actualizar el estado, el servidor emite `alerta_actualizada` via Socket.io.

---

## 3. Clima

### GET `/api/weather/:zona`

Retorna condiciones climáticas actuales para una zona.

**Zonas válidas:** `Parque Tunari`, `Sacaba`, `Quillacollo`, `Cercado`

**Request:**
```http
GET /api/weather/Parque%20Tunari
```

**Response 200 OK:**
```json
{
  "success": true,
  "data": {
    "zona": "Parque Tunari",
    "coordenadas": {
      "lat": -17.2800,
      "lng": -66.2100
    },
    "viento": {
      "velocidad": 45,
      "direccion": 350,
      "descripcion": "Norte (N)"
    },
    "temperatura": 32,
    "humedad": 18,
    "condicion": "Seco y ventoso - Alto riesgo de incendio",
    "indiceRiesgo": "EXTREMO",
    "timestamp": "2024-11-15T14:45:00Z"
  }
}
```

---

## 4. Integraciones

### POST `/api/integrations/movis`

Webhook para recibir datos del sistema MOVIS (imágenes satelitales térmicas).

**Headers requeridos:**
```http
X-API-Key: <clave_api_movis>
X-Source: MOVIS
Content-Type: application/json
```

**Request body:**
```json
{
  "source": "MOVIS",
  "timestamp": "2024-11-15T14:00:00Z",
  "satellite": "MODIS-Terra",
  "hotspots": [
    {
      "lat": -17.2800,
      "lng": -66.2100,
      "frp": 85.3,
      "confidence": 92,
      "ndvi": -0.12,
      "thermalAnomaly": true,
      "zona": "Parque Tunari"
    }
  ],
  "windData": {
    "speed": 45,
    "direction": 350,
    "unit": "km/h"
  }
}
```

**Response 200 OK:**
```json
{
  "success": true,
  "message": "Datos MOVIS procesados",
  "alertasCreadas": 1
}
```

---

### POST `/api/integrations/viir`

Webhook para recibir datos del sistema VIIR (VIIRS/Suomi NPP).

**Headers requeridos:**
```http
X-API-Key: <clave_api_viir>
X-Source: VIIR
Content-Type: application/json
```

**Request body:**
```json
{
  "source": "VIIR",
  "timestamp": "2024-11-15T14:15:00Z",
  "satellite": "Suomi-NPP",
  "detections": [
    {
      "lat": -17.3950,
      "lng": -66.0450,
      "brightness": 342.5,
      "scan": 0.39,
      "track": 0.36,
      "confidence": "high",
      "version": "2.0NRT",
      "zona": "Sacaba"
    }
  ]
}
```

---

### POST `/api/integrations/ai-model`

Webhook para alertas generadas por el modelo de IA de predicción de incendios.

**Request body:**
```json
{
  "source": "modelo_ia",
  "modelVersion": "fireguard-v2.1",
  "timestamp": "2024-11-15T14:20:00Z",
  "prediction": {
    "lat": -17.3950,
    "lng": -66.3600,
    "zona": "Quillacollo",
    "probabilidadIncendio": 0.87,
    "severidadEstimada": "alta",
    "factoresRiesgo": ["viento_alto", "humedad_baja", "temperatura_alta", "vegetacion_seca"],
    "ventanaTiempo": "2-4 horas",
    "confianza": 0.91
  }
}
```

---

## 5. Socket.io Events

### Conexión

```javascript
import { io } from 'socket.io-client';

const socket = io('http://localhost:3000', {
  transports: ['websocket'],
  auth: {
    token: 'Bearer <jwt_token>'  // opcional
  }
});

socket.on('connect', () => {
  console.log('Conectado al servidor FireGuard:', socket.id);
});
```

---

### Evento: `nueva_alerta`

Emitido por el servidor cuando se crea una nueva alerta.

**Payload:**
```json
{
  "id": "alert-007",
  "tipo": "incendio_forestal",
  "severidad": "critica",
  "lat": -17.2800,
  "lng": -66.2100,
  "zona": "Parque Tunari",
  "descripcion": "Nuevo foco detectado vía satélite MODIS.",
  "vientoVelocidad": 50,
  "vientoDireccion": 320,
  "temperatura": 35,
  "humedad": 12,
  "estado": "activa",
  "origen": "movis",
  "timestamp": "2024-11-15T15:00:00Z",
  "bomberosAsignados": []
}
```

**Uso en React Native:**
```javascript
socket.on('nueva_alerta', (alerta) => {
  // Agregar a la lista de alertas
  dispatch(addAlerta(alerta));

  // Mostrar notificación local
  Notifications.scheduleNotificationAsync({
    content: {
      title: `🔥 Nueva Alerta - ${alerta.severidad.toUpperCase()}`,
      body: `${alerta.zona}: ${alerta.descripcion}`,
      sound: true,
    },
    trigger: null,
  });
});
```

---

### Evento: `alerta_actualizada`

Emitido cuando el estado de una alerta cambia.

**Payload:**
```json
{
  "id": "alert-001",
  "estado": "atendida",
  "zona": "Parque Tunari",
  "severidad": "critica",
  "timestamp": "2024-11-15T15:30:00Z"
}
```

**Uso en React Native:**
```javascript
socket.on('alerta_actualizada', (alerta) => {
  dispatch(updateAlerta(alerta));
});
```

---

## 6. Códigos de Error

| Código | Significado |
|--------|-------------|
| 200 | OK — Solicitud exitosa |
| 201 | Created — Recurso creado |
| 400 | Bad Request — Datos inválidos |
| 401 | Unauthorized — Token faltante o inválido |
| 403 | Forbidden — Sin permisos para esta acción |
| 404 | Not Found — Recurso no encontrado |
| 422 | Unprocessable Entity — Error de validación |
| 500 | Internal Server Error — Error del servidor |

---

## Modelos de Datos

### Alert

```typescript
interface Alert {
  id: string;
  tipo: string;                              // 'incendio_forestal' | 'conato' | 'humo'
  severidad: 'baja' | 'media' | 'alta' | 'critica';
  lat: number;
  lng: number;
  zona: string;
  descripcion: string;
  vientoVelocidad: number;                   // km/h
  vientoDireccion: number;                   // grados 0-360
  temperatura: number;                       // °C
  humedad: number;                           // %
  estado: 'activa' | 'atendida' | 'cerrada';
  origen: 'movis' | 'viir' | 'modelo_ia' | 'bombero';
  timestamp: string;                         // ISO 8601
  bomberosAsignados: string[];               // array de user IDs
}
```

### User

```typescript
interface User {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  rol: 'bombero' | 'jefe' | 'admin';
  unidad: string;
  activo: boolean;
  fechaCreacion: string;                     // ISO 8601
}
```

---

*Documentación generada para FireGuard Cochabamba v1.0.0*
