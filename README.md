# 🔥 FireGuard Cochabamba

> **Sistema de Alerta Temprana para Bomberos de Cochabamba**  
> Plataforma móvil en tiempo real para la gestión y respuesta ante incendios forestales en el departamento de Cochabamba, Bolivia.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Platform](https://img.shields.io/badge/platform-Android%20%7C%20iOS-green.svg)
![Backend](https://img.shields.io/badge/backend-Node.js%20%2B%20TypeScript-brightgreen.svg)
![Mobile](https://img.shields.io/badge/mobile-React%20Native%20%2B%20Expo-blue.svg)

---

## 📋 Descripción

FireGuard Cochabamba es una aplicación móvil diseñada para el **Cuerpo de Bomberos de Cochabamba** que permite:

- Recibir alertas tempranas de incendios forestales en tiempo real
- Visualizar focos de calor en mapa interactivo
- Coordinar unidades de respuesta
- Integrar datos satelitales del sistema **MOVIS/VIIR** y modelos de **Inteligencia Artificial**
- Monitorear condiciones climáticas (viento, temperatura, humedad) por zona

---

## 🏗️ Arquitectura

```
┌─────────────────────────────────────────────────────────────────┐
│                        FUENTES DE DATOS                         │
│   ┌───────────────┐  ┌───────────────┐  ┌──────────────────┐   │
│   │  MOVIS System │  │  VIIR Satélite│  │   Modelo IA      │   │
│   │  (Satélite)   │  │  (NASA FIRMS) │  │  (Predicción)    │   │
│   └───────┬───────┘  └───────┬───────┘  └────────┬─────────┘   │
│           └──────────────────┴──────────────────┘             │
└─────────────────────────────┬───────────────────────────────────┘
                              │ Webhooks / REST
┌─────────────────────────────▼───────────────────────────────────┐
│                     BACKEND (Node.js + TypeScript)              │
│                                                                 │
│   ┌─────────────────────────────────────────────────────────┐  │
│   │                   Express REST API                       │  │
│   │  POST /api/auth/login    GET /api/alerts                │  │
│   │  GET  /api/auth/me       POST /api/alerts               │  │
│   │  GET  /api/weather/:zona PATCH /api/alerts/:id/estado   │  │
│   └─────────────────────────────────────────────────────────┘  │
│                                                                 │
│   ┌──────────────────────────┐  ┌────────────────────────────┐ │
│   │      Socket.io Server    │  │    In-Memory Data Store    │ │
│   │  emit: nueva_alerta      │  │  users[], alerts[]         │ │
│   │  emit: alerta_actualizada│  │  (mock → PostgreSQL/PostGIS│ │
│   └──────────────────────────┘  └────────────────────────────┘ │
└─────────────────────────────┬───────────────────────────────────┘
                              │ HTTP + WebSocket
┌─────────────────────────────▼───────────────────────────────────┐
│                MOBILE APP (React Native + Expo)                 │
│                                                                 │
│  ┌─────────┐  ┌──────────┐  ┌────────┐  ┌──────────────────┐  │
│  │  Login  │  │Dashboard │  │  Mapa  │  │  Detalle Alerta  │  │
│  │ Screen  │  │ (Alertas)│  │(Google)│  │  + Clima + Viento│  │
│  └─────────┘  └──────────┘  └────────┘  └──────────────────┘  │
│                                                                 │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  Socket.io Client — nueva_alerta → notificación local     │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

---

## ⚙️ Tech Stack

| Capa | Tecnología | Versión |
|------|-----------|---------|
| Mobile | React Native + Expo | SDK 51 |
| Routing | Expo Router | v3 |
| Maps | react-native-maps | latest |
| Notifications | expo-notifications | latest |
| Backend | Node.js + Express | v20 LTS |
| Lenguaje backend | TypeScript | ^5.3 |
| Autenticación | JWT (jsonwebtoken + bcryptjs) | latest |
| Tiempo real | Socket.io | ^4.6 |
| Base de datos | PostgreSQL + PostGIS | 15 |
| Contenerización | Docker + docker-compose | latest |

---

## ✨ Características

### 🔐 Autenticación
- Login seguro con JWT
- Roles: `bombero`, `jefe`, `admin`
- Sesión persistente con AsyncStorage

### 📊 Dashboard de Alertas
- Lista en tiempo real de alertas activas
- Filtrado por zona y estado
- Indicadores de severidad: crítica / alta / media / baja
- Pull-to-refresh

### 🗺️ Mapa Interactivo
- Vista Google Maps centrada en Cochabamba
- Marcadores codificados por color según severidad
- Zonas de cobertura superpuestas
- Tap → detalle rápido de alerta

### 🔔 Notificaciones Push
- Notificaciones locales al recibir `nueva_alerta` via Socket.io
- Alerta sonora y vibración configurable

### 🌬️ Datos Climáticos
- Viento: velocidad (km/h) y dirección
- Temperatura y humedad por zona
- Actualización en tiempo real

### 📡 Integración Satelital
- Datos de focos de calor desde MOVIS/VIIR
- Predicciones de modelo IA
- Webhooks para ingesta automática

---

## 🗺️ Zonas de Cobertura

| Zona | Latitud | Longitud | Descripción |
|------|---------|----------|-------------|
| Parque Tunari | -17.2800 | -66.2100 | Área forestal protegida |
| Sacaba | -17.3950 | -66.0450 | Municipio noreste |
| Quillacollo | -17.3950 | -66.3600 | Municipio oeste |
| Cercado | -17.3833 | -66.1667 | Centro urbano Cochabamba |

---

## 🚀 Instalación y Configuración

### Prerrequisitos

- **Node.js** v18 o superior → [nodejs.org](https://nodejs.org)
- **npm** v9 o superior
- **Expo CLI** → `npm install -g expo-cli`
- **Git** → [git-scm.com](https://git-scm.com)
- Dispositivo físico o emulador Android/iOS

### Paso 1: Clonar el repositorio

```bash
git clone https://github.com/tu-usuario/fireguard-cochabamba.git
cd fireguard-cochabamba
```

### Paso 2: Setup automático (Windows)

```bat
setup.bat
```

O con PowerShell:

```powershell
.\setup.ps1
```

### Paso 3: Configurar variables de entorno del backend

```bash
cd backend
cp .env.example .env
```

Editar `backend/.env`:

```env
PORT=3000
JWT_SECRET=tu_secreto_muy_seguro_aqui
JWT_EXPIRATION=24h
NODE_ENV=development
CORS_ORIGIN=*
```

### Paso 4: Iniciar el Backend

```bash
cd backend
npm run dev
```

Deberías ver:
```
🚒 FireGuard Backend iniciado
📡 Puerto: 3000
🌍 Entorno: development
🔌 Socket.io listo
```

### Paso 5: Iniciar la App Móvil

```bash
cd mobile
npx expo start
```

Luego:
- Presiona `a` para Android
- Presiona `i` para iOS
- Escanea el QR con la app **Expo Go** en tu teléfono

### Paso 6 (opcional): Docker

```bash
docker-compose up -d
```

Levanta backend en puerto `3000` y PostgreSQL en `5432`.

---

## 📡 API Endpoints

| Método | Endpoint | Autenticación | Descripción |
|--------|----------|---------------|-------------|
| POST | `/api/auth/login` | No | Iniciar sesión |
| GET | `/api/auth/me` | Bearer JWT | Perfil del usuario actual |
| GET | `/api/alerts` | Opcional | Listar alertas (con filtros) |
| POST | `/api/alerts` | Bearer JWT | Crear nueva alerta |
| GET | `/api/alerts/active` | Opcional | Solo alertas activas |
| GET | `/api/alerts/:id` | Opcional | Detalle de alerta |
| PATCH | `/api/alerts/:id/estado` | Bearer JWT | Actualizar estado |
| GET | `/api/weather/:zona` | Opcional | Clima por zona |
| POST | `/api/integrations/movis` | API Key | Webhook MOVIS |
| POST | `/api/integrations/viir` | API Key | Webhook VIIR |

Ver [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) para ejemplos completos.

---

## 🔌 Socket.io Events

| Evento | Dirección | Descripción |
|--------|-----------|-------------|
| `nueva_alerta` | Server → Client | Nueva alerta detectada |
| `alerta_actualizada` | Server → Client | Estado de alerta modificado |
| `connection` | Client → Server | Cliente conectado |
| `disconnect` | Client → Server | Cliente desconectado |

---

## 👤 Usuarios de Prueba (Mock)

| Email | Contraseña | Rol |
|-------|-----------|-----|
| `admin@bomberos-cbba.bo` | `Admin123!` | admin |
| `jefe@bomberos-cbba.bo` | `Jefe123!` | jefe |
| `bombero@bomberos-cbba.bo` | `Bombero123!` | bombero |

---

## 📸 Screenshots

> _Capturas de pantalla próximamente..._

| Login | Dashboard | Mapa | Detalle Alerta |
|-------|-----------|------|----------------|
| _(imagen)_ | _(imagen)_ | _(imagen)_ | _(imagen)_ |

---

## 📁 Estructura del Proyecto

```
fireguard-cochabamba/
├── README.md
├── API_DOCUMENTATION.md
├── INTEGRATION_GUIDE.md
├── setup.bat
├── setup.ps1
├── docker-compose.yml
├── .gitignore
├── backend/
│   ├── package.json
│   ├── tsconfig.json
│   ├── .env.example
│   └── src/
│       ├── index.ts
│       ├── config/
│       ├── controllers/
│       ├── middleware/
│       ├── models/
│       ├── routes/
│       ├── services/
│       └── utils/
└── mobile/
    ├── package.json
    ├── app.json
    ├── babel.config.js
    ├── metro.config.js
    ├── app/
    │   ├── _layout.tsx
    │   ├── index.tsx
    │   ├── login.tsx
    │   ├── alert-detail.tsx
    │   └── (tabs)/
    │       ├── _layout.tsx
    │       ├── index.tsx
    │       ├── mapa.tsx
    │       └── perfil.tsx
    ├── components/
    └── constants/
```

---

## 🤝 Contribuir

1. Fork el repositorio
2. Crea una rama: `git checkout -b feature/nueva-funcionalidad`
3. Commit: `git commit -m 'feat: agregar nueva funcionalidad'`
4. Push: `git push origin feature/nueva-funcionalidad`
5. Abre un Pull Request

---

## 📜 Licencia

Este proyecto está licenciado bajo la **Licencia MIT**.  
Ver el archivo [LICENSE](./LICENSE) para más detalles.

```
MIT License

Copyright (c) 2024 FireGuard Cochabamba Team

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.
```

---

## 🆘 Soporte

Para soporte técnico o reportar bugs, abrir un [Issue](https://github.com/tu-usuario/fireguard-cochabamba/issues).

---

*Desarrollado con ❤️ para el Cuerpo de Bomberos de Cochabamba 🇧🇴*
