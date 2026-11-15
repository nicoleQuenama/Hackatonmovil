@echo off
setlocal enabledelayedexpansion

:: =====================================================
:: FireGuard Cochabamba - Setup Script (Windows Batch)
:: =====================================================

title FireGuard Cochabamba - Setup

echo.
echo  =====================================
echo   FIREGUARD COCHABAMBA - SETUP
echo  =====================================
echo.

:: Check Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js no encontrado. Por favor instala Node.js desde https://nodejs.org
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
echo [OK] Node.js encontrado: %NODE_VERSION%

:: Check npm
where npm >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] npm no encontrado.
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('npm --version') do set NPM_VERSION=%%i
echo [OK] npm encontrado: v%NPM_VERSION%
echo.

:: ---- BACKEND SETUP ----
echo [1/2] Instalando dependencias del BACKEND...
echo  -----------------------------------------

if not exist "backend" (
    echo [ERROR] Carpeta backend/ no encontrada. Asegurate de estar en la raiz del proyecto.
    pause
    exit /b 1
)

cd backend
echo [INFO] Ejecutando: npm install en backend/
npm install
if %errorlevel% neq 0 (
    echo [ERROR] Fallo al instalar dependencias del backend.
    cd ..
    pause
    exit /b 1
)
echo [OK] Backend - dependencias instaladas correctamente.
cd ..

echo.

:: ---- MOBILE SETUP ----
echo [2/2] Instalando dependencias de la APP MOVIL...
echo  -----------------------------------------

if not exist "mobile" (
    echo [ERROR] Carpeta mobile/ no encontrada.
    pause
    exit /b 1
)

cd mobile
echo [INFO] Ejecutando: npm install en mobile/
npm install
if %errorlevel% neq 0 (
    echo [ERROR] Fallo al instalar dependencias de la app movil.
    cd ..
    pause
    exit /b 1
)
echo [OK] Mobile - dependencias instaladas correctamente.
cd ..

echo.

:: ---- ENV SETUP ----
echo [INFO] Verificando archivo .env del backend...
if not exist "backend\.env" (
    if exist "backend\.env.example" (
        copy "backend\.env.example" "backend\.env" >nul
        echo [OK] Archivo backend/.env creado a partir de .env.example
        echo [AVISO] Edita backend/.env con tus valores reales antes de iniciar.
    ) else (
        echo [AVISO] No se encontro backend/.env.example. Crea backend/.env manualmente.
    )
) else (
    echo [OK] backend/.env ya existe.
)

echo.
echo  =====================================
echo   Setup completado!
echo  =====================================
echo.
echo  Para iniciar el proyecto:
echo.
echo  1. Backend:
echo     cd backend
echo     npm run dev
echo.
echo  2. App movil (en otra terminal):
echo     cd mobile
echo     npx expo start
echo.
echo  Usuarios de prueba:
echo    admin@bomberos-cbba.bo / Admin123!
echo    jefe@bomberos-cbba.bo  / Jefe123!
echo    bombero@bomberos-cbba.bo / Bombero123!
echo.

pause
