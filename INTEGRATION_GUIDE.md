# 🔗 FireGuard Cochabamba — Guía de Integración MOVIS/VIIR

Guía técnica para integrar el sistema externo de monitoreo satelital **MOVIS/VIIR** (u otros sistemas de alerta) con el backend de FireGuard Cochabamba.

---

## Tabla de Contenidos

1. [Visión General](#visión-general)
2. [Formato de Datos MOVIS](#formato-de-datos-movis)
3. [Formato de Datos VIIR](#formato-de-datos-viir)
4. [Formato de Alertas del Modelo IA](#formato-de-alertas-del-modelo-ia)
5. [Configuración de Webhooks](#configuración-de-webhooks)
6. [Autenticación para Sistemas Externos](#autenticación-para-sistemas-externos)
7. [Flujo de Integración Completo](#flujo-de-integración-completo)
8. [Manejo de Errores](#manejo-de-errores)
9. [Testing de la Integración](#testing-de-la-integración)

---

## 1. Visión General

```
┌──────────────────────────────────────────────────────────────────┐
│                    SISTEMAS EXTERNOS                             │
│                                                                  │
│  ┌─────────────────┐    ┌────────────────┐    ┌──────────────┐  │
│  │  MOVIS System   │    │  VIIR / NASA   │    │  Modelo IA   │  │
│  │  (Satélite      │    │  FIRMS         │    │  (Predicción)│  │
│  │   Térmico)      │    │                │    │              │  │
│  └────────┬────────┘    └───────┬────────┘    └──────┬───────┘  │
│           │                    │                     │          │
└───────────┼────────────────────┼─────────────────────┼──────────┘
            │  HTTPS POST        │  HTTPS POST         │  HTTPS POST
            ▼                    ▼                     ▼
┌──────────────────────────────────────────────────────────────────┐
│                   FIREGUARD BACKEND                              │
│                                                                  │
│  POST /api/integrations/movis                                    │
│  POST /api/integrations/viir                                     │
│  POST /api/integrations/ai-model                                 │
│                                                                  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  Procesamiento: validar → normalizar → crear alerta       │  │
│  │                      ↓                                    │  │
│  │  Socket.io: emit("nueva_alerta") → todos los clientes     │  │
│  └───────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────┘
            │
            ▼
┌────────────────────────────────────────┐
│   App Móvil FireGuard                  │
│   - Notificación push local            │
│   - Alerta aparece en dashboard        │
│   - Marcador en mapa                   │
└────────────────────────────────────────┘
```

---

## 2. Formato de Datos MOVIS

### Endpoint destino
```
POST https://api.fireguard-cbba.bo/api/integrations/movis
```

### Headers requeridos
```http
Content-Type: application/json
X-API-Key: <clave_api_proporcionada_por_fireguard>
X-Source: MOVIS
X-Timestamp: 2024-11-15T14:00:00Z
```

### Schema del payload

```json
{
  "source": "MOVIS",
  "timestamp": "<ISO 8601>",
  "satellite": "<nombre del satélite>",
  "orbitPath": "<número de órbita, opcional>",
  "hotspots": [
    {
      "lat": "<decimal, negativo para Sur>",
      "lng": "<decimal, negativo para Oeste>",
      "frp": "<Fire Radiative Power en MW>",
      "confidence": "<0-100, porcentaje de confianza>",
      "ndvi": "<Normalized Difference Vegetation Index, -1 a 1>",
      "thermalAnomaly": "<boolean>",
      "zona": "<nombre de zona en Cochabamba>",
      "areaEstimada": "<hectáreas estimadas, opcional>"
    }
  ],
  "windData": {
    "speed": "<velocidad en km/h>",
    "direction": "<grados 0-360>",
    "unit": "km/h"
  },
  "atmosphericData": {
    "temperature": "<°C>",
    "humidity": "<porcentaje 0-100>",
    "pressure": "<hPa, opcional>"
  }
}
```

### Ejemplo real

```json
{
  "source": "MOVIS",
  "timestamp": "2024-11-15T14:00:00Z",
  "satellite": "MODIS-Terra",
  "orbitPath": "04512",
  "hotspots": [
    {
      "lat": -17.2800,
      "lng": -66.2100,
      "frp": 85.3,
      "confidence": 92,
      "ndvi": -0.12,
      "thermalAnomaly": true,
      "zona": "Parque Tunari",
      "areaEstimada": 15.5
    },
    {
      "lat": -17.3950,
      "lng": -66.0450,
      "frp": 42.1,
      "confidence": 78,
      "ndvi": 0.05,
      "thermalAnomaly": true,
      "zona": "Sacaba",
      "areaEstimada": 7.2
    }
  ],
  "windData": {
    "speed": 45,
    "direction": 350,
    "unit": "km/h"
  },
  "atmosphericData": {
    "temperature": 32,
    "humidity": 18,
    "pressure": 758
  }
}
```

### Mapeo MOVIS → FireGuard Alert

| Campo MOVIS | Campo Alert FireGuard | Transformación |
|-------------|----------------------|----------------|
| `hotspots[i].lat` | `lat` | Directo |
| `hotspots[i].lng` | `lng` | Directo |
| `hotspots[i].zona` | `zona` | Directo |
| `hotspots[i].frp` | `severidad` | FRP < 20 → baja; 20-50 → media; 50-100 → alta; > 100 → critica |
| `hotspots[i].confidence` | (filtro) | Si confidence < 60, descartar |
| `windData.speed` | `vientoVelocidad` | Directo |
| `windData.direction` | `vientoDireccion` | Directo |
| `atmosphericData.temperature` | `temperatura` | Directo |
| `atmosphericData.humidity` | `humedad` | Directo |
| `"MOVIS"` | `origen` | Mapear a `"movis"` |

---

## 3. Formato de Datos VIIR

### Endpoint destino
```
POST https://api.fireguard-cbba.bo/api/integrations/viir
```

### Headers requeridos
```http
Content-Type: application/json
X-API-Key: <clave_api_proporcionada_por_fireguard>
X-Source: VIIR
```

### Schema del payload

Basado en el estándar **NASA FIRMS VIIRS** (formato adaptado):

```json
{
  "source": "VIIR",
  "timestamp": "<ISO 8601>",
  "satellite": "<Suomi-NPP | NOAA-20 | NOAA-21>",
  "instrument": "VIIRS",
  "detections": [
    {
      "lat": "<decimal>",
      "lng": "<decimal>",
      "brightness": "<temperatura de brillo en Kelvin>",
      "bright_t31": "<temperatura banda T31, opcional>",
      "scan": "<tamaño pixel en km>",
      "track": "<tamaño pixel en km>",
      "confidence": "<low | nominal | high>",
      "version": "<versión del algoritmo>",
      "frp": "<Fire Radiative Power en MW>",
      "daynight": "<D | N>",
      "zona": "<zona de Cochabamba>"
    }
  ],
  "acquisitionDate": "<YYYY-MM-DD>",
  "acquisitionTime": "<HH:MM>"
}
```

### Ejemplo real

```json
{
  "source": "VIIR",
  "timestamp": "2024-11-15T14:15:00Z",
  "satellite": "Suomi-NPP",
  "instrument": "VIIRS",
  "detections": [
    {
      "lat": -17.3950,
      "lng": -66.0450,
      "brightness": 342.5,
      "bright_t31": 298.3,
      "scan": 0.39,
      "track": 0.36,
      "confidence": "high",
      "version": "2.0NRT",
      "frp": 38.2,
      "daynight": "D",
      "zona": "Sacaba"
    }
  ],
  "acquisitionDate": "2024-11-15",
  "acquisitionTime": "14:15"
}
```

### Mapeo VIIR → FireGuard Alert

| Campo VIIR | Campo Alert FireGuard | Transformación |
|------------|----------------------|----------------|
| `detections[i].lat` | `lat` | Directo |
| `detections[i].lng` | `lng` | Directo |
| `detections[i].zona` | `zona` | Directo |
| `detections[i].confidence` | (filtro) | low → descartar; nominal → procesar; high → procesar |
| `detections[i].frp` | `severidad` | Mismo mapeo que MOVIS |
| `detections[i].brightness` | `descripcion` | Incluir en descripción |
| `"VIIR"` | `origen` | Mapear a `"viir"` |

---

## 4. Formato de Alertas del Modelo IA

### Endpoint destino
```
POST https://api.fireguard-cbba.bo/api/integrations/ai-model
```

### Schema del payload

```json
{
  "source": "modelo_ia",
  "modelName": "<nombre del modelo>",
  "modelVersion": "<versión semántica>",
  "timestamp": "<ISO 8601>",
  "predictions": [
    {
      "lat": "<decimal>",
      "lng": "<decimal>",
      "zona": "<zona de Cochabamba>",
      "probabilidadIncendio": "<0.0 a 1.0>",
      "severidadEstimada": "<baja | media | alta | critica>",
      "factoresRiesgo": ["<factor1>", "<factor2>"],
      "ventanaTiempo": "<descripción del horizonte temporal>",
      "confianza": "<0.0 a 1.0>",
      "metadata": {
        "inputFeatures": {
          "ndvi": "<valor>",
          "temperatura": "<°C>",
          "humedad": "<porcentaje>",
          "vientoVelocidad": "<km/h>",
          "vientoDireccion": "<grados>",
          "precipitacionAcumulada": "<mm últimas 72h>"
        }
      }
    }
  ]
}
```

### Ejemplo real

```json
{
  "source": "modelo_ia",
  "modelName": "FireGuard-LSTM-Cochabamba",
  "modelVersion": "2.1.0",
  "timestamp": "2024-11-15T14:20:00Z",
  "predictions": [
    {
      "lat": -17.3950,
      "lng": -66.3600,
      "zona": "Quillacollo",
      "probabilidadIncendio": 0.87,
      "severidadEstimada": "alta",
      "factoresRiesgo": [
        "viento_alto",
        "humedad_baja",
        "temperatura_extrema",
        "vegetacion_seca",
        "sin_precipitacion_72h"
      ],
      "ventanaTiempo": "2-4 horas",
      "confianza": 0.91,
      "metadata": {
        "inputFeatures": {
          "ndvi": -0.08,
          "temperatura": 34,
          "humedad": 15,
          "vientoVelocidad": 52,
          "vientoDireccion": 320,
          "precipitacionAcumulada": 0.0
        }
      }
    }
  ]
}
```

### Reglas de procesamiento para predicciones IA

| `probabilidadIncendio` | `confianza` | Acción |
|------------------------|-------------|--------|
| < 0.5 | cualquiera | Ignorar |
| 0.5 – 0.7 | < 0.7 | Registrar sin notificar |
| 0.5 – 0.7 | ≥ 0.7 | Crear alerta severidad baja/media |
| > 0.7 | ≥ 0.7 | Crear alerta + notificar via Socket.io |
| > 0.9 | ≥ 0.8 | Crear alerta crítica + notificación urgente |

---

## 5. Configuración de Webhooks

### Desde el sistema MOVIS/VIIR

Configurar el sistema externo para enviar POSTs a:

```
# Desarrollo
http://<ip-servidor-local>:3000/api/integrations/movis
http://<ip-servidor-local>:3000/api/integrations/viir

# Producción
https://api.fireguard-cbba.bo/api/integrations/movis
https://api.fireguard-cbba.bo/api/integrations/viir
```

### Frecuencia de envío recomendada

| Sistema | Frecuencia | Tipo |
|---------|-----------|------|
| MOVIS (MODIS) | Cada 1-2 horas | Por pasada satelital |
| VIIR (VIIRS/NPP) | Cada 1-2 horas | Por pasada satelital |
| Modelo IA | Cada 30 minutos | Continuo |

### Reintentos y timeout

- **Timeout esperado:** 30 segundos
- **Reintentos:** 3 intentos con backoff exponencial (1min, 5min, 15min)
- **Si falla:** Registrar en log local para envío posterior

---

## 6. Autenticación para Sistemas Externos

### API Keys

Cada sistema externo recibe una API Key única. Para obtener una:

1. Contactar al administrador de FireGuard Cochabamba
2. Se genera una clave con formato: `fgcbba_<sistema>_<32chars_aleatorios>`

**Ejemplo:**
```
fgcbba_movis_a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4
fgcbba_viir_x9y8z7w6v5u4x9y8z7w6v5u4x9y8z7w6
```

### Envío de la API Key

Incluir en el header de cada request:

```http
X-API-Key: fgcbba_movis_a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4
```

### Rotación de claves

- Las API Keys expiran cada **90 días**
- El administrador enviará la nueva clave 7 días antes de la expiración
- Se aceptan ambas claves durante un período de transición de 7 días

### IP Allowlist (Producción)

Para mayor seguridad, registrar las IPs de los servidores MOVIS/VIIR con el administrador. Las IPs no registradas recibirán `403 Forbidden`.

---

## 7. Flujo de Integración Completo

```
1. Sistema MOVIS detecta foco de calor vía satélite
        ↓
2. MOVIS procesa imagen y genera payload JSON
        ↓
3. MOVIS envía POST a /api/integrations/movis con X-API-Key
        ↓
4. FireGuard Backend valida API Key
        ↓
5. Backend filtra hotspots (confidence < 60% → descartado)
        ↓
6. Backend normaliza datos → crea objeto Alert
        ↓
7. Alert se guarda en la base de datos
        ↓
8. Backend emite evento Socket.io "nueva_alerta"
        ↓
9. App móvil recibe "nueva_alerta"
        ↓
10. App muestra notificación push local
        ↓
11. Alerta aparece en dashboard y mapa
        ↓
12. Bombero puede cambiar estado → "atendida"
        ↓
13. Backend emite "alerta_actualizada" vía Socket.io
```

---

## 8. Manejo de Errores

### Respuestas de error del backend

| Código | Situación | Acción recomendada |
|--------|-----------|-------------------|
| 400 | Payload malformado | Revisar formato JSON |
| 401 | API Key inválida | Verificar X-API-Key header |
| 403 | IP no permitida | Registrar IP con administrador |
| 422 | Datos fuera de rango | Ver detalle en campo `errors` |
| 429 | Rate limit excedido | Esperar y reintentar |
| 500 | Error interno | Reintentar después de 15 min |

**Ejemplo respuesta error 422:**
```json
{
  "success": false,
  "error": "Datos de integración inválidos",
  "errors": [
    { "field": "hotspots[0].lat", "message": "Latitud fuera del rango de Cochabamba (-17 a -18)" },
    { "field": "hotspots[0].confidence", "message": "Debe ser un número entre 0 y 100" }
  ]
}
```

### Validaciones del backend

**Coordenadas válidas para Cochabamba:**
- Latitud: -18.5 a -16.5
- Longitud: -67.0 a -65.5

**Zonas reconocidas:**
- `"Parque Tunari"`
- `"Sacaba"`
- `"Quillacollo"`
- `"Cercado"`
- `"Colomi"` (futura expansión)
- `"Chapare"` (futura expansión)

---

## 9. Testing de la Integración

### Envío de prueba con cURL

```bash
# Test MOVIS
curl -X POST http://localhost:3000/api/integrations/movis \
  -H "Content-Type: application/json" \
  -H "X-API-Key: fgcbba_movis_test_key" \
  -H "X-Source: MOVIS" \
  -d '{
    "source": "MOVIS",
    "timestamp": "2024-11-15T14:00:00Z",
    "satellite": "MODIS-Terra",
    "hotspots": [{
      "lat": -17.2800,
      "lng": -66.2100,
      "frp": 95.0,
      "confidence": 88,
      "ndvi": -0.15,
      "thermalAnomaly": true,
      "zona": "Parque Tunari"
    }],
    "windData": {"speed": 45, "direction": 350, "unit": "km/h"},
    "atmosphericData": {"temperature": 32, "humidity": 18}
  }'
```

```bash
# Test VIIR
curl -X POST http://localhost:3000/api/integrations/viir \
  -H "Content-Type: application/json" \
  -H "X-API-Key: fgcbba_viir_test_key" \
  -H "X-Source: VIIR" \
  -d '{
    "source": "VIIR",
    "timestamp": "2024-11-15T14:15:00Z",
    "satellite": "Suomi-NPP",
    "instrument": "VIIRS",
    "detections": [{
      "lat": -17.3950,
      "lng": -66.0450,
      "brightness": 342.5,
      "scan": 0.39,
      "track": 0.36,
      "confidence": "high",
      "version": "2.0NRT",
      "frp": 38.2,
      "daynight": "D",
      "zona": "Sacaba"
    }],
    "acquisitionDate": "2024-11-15",
    "acquisitionTime": "14:15"
  }'
```

### Verificación en tiempo real

1. Abrir la app móvil FireGuard
2. Conectarse con cualquier usuario de prueba
3. Enviar el cURL de test
4. Verificar que aparece notificación push en el dispositivo
5. Verificar que la alerta aparece en el dashboard
6. Verificar que el marcador aparece en el mapa

---

## Contacto Técnico

Para configurar la integración con FireGuard Cochabamba:

- **Email:** integrations@fireguard-cbba.bo
- **Repositorio:** https://github.com/fireguard-cochabamba/fireguard-cochabamba
- **Documentación API:** [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)

---

*Guía de Integración FireGuard Cochabamba v1.0.0 — 2024*
