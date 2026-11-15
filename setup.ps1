# =====================================================
# FireGuard Cochabamba - Setup Script (PowerShell)
# =====================================================

$ErrorActionPreference = "Stop"

function Write-Header {
    param([string]$Text)
    Write-Host ""
    Write-Host "  =====================================" -ForegroundColor Cyan
    Write-Host "  $Text" -ForegroundColor Cyan
    Write-Host "  =====================================" -ForegroundColor Cyan
    Write-Host ""
}

function Write-Step {
    param([string]$Text)
    Write-Host "[>>] $Text" -ForegroundColor Yellow
}

function Write-Success {
    param([string]$Text)
    Write-Host "[OK] $Text" -ForegroundColor Green
}

function Write-Info {
    param([string]$Text)
    Write-Host "[INFO] $Text" -ForegroundColor Cyan
}

function Write-Warn {
    param([string]$Text)
    Write-Host "[AVISO] $Text" -ForegroundColor Magenta
}

function Write-Fail {
    param([string]$Text)
    Write-Host "[ERROR] $Text" -ForegroundColor Red
}

# ---- Header ----
Write-Header "FIREGUARD COCHABAMBA - SETUP"

# ---- Check Node.js ----
Write-Step "Verificando Node.js..."
try {
    $nodeVersion = node --version
    Write-Success "Node.js encontrado: $nodeVersion"
} catch {
    Write-Fail "Node.js no encontrado. Instala desde https://nodejs.org"
    exit 1
}

# ---- Check npm ----
try {
    $npmVersion = npm --version
    Write-Success "npm encontrado: v$npmVersion"
} catch {
    Write-Fail "npm no encontrado."
    exit 1
}

Write-Host ""

# ---- Backend Setup ----
Write-Step "1/2 — Instalando dependencias del BACKEND..."
Write-Host "  -----------------------------------------"

$backendPath = Join-Path $PSScriptRoot "backend"
if (-not (Test-Path $backendPath)) {
    Write-Fail "Carpeta backend/ no encontrada. Asegurate de ejecutar este script desde la raiz del proyecto."
    exit 1
}

Push-Location $backendPath
Write-Info "Ejecutando: npm install en backend/"
try {
    npm install
    Write-Success "Backend - dependencias instaladas correctamente."
} catch {
    Write-Fail "Fallo al instalar dependencias del backend: $_"
    Pop-Location
    exit 1
}
Pop-Location

Write-Host ""

# ---- Mobile Setup ----
Write-Step "2/2 — Instalando dependencias de la APP MOVIL..."
Write-Host "  -----------------------------------------"

$mobilePath = Join-Path $PSScriptRoot "mobile"
if (-not (Test-Path $mobilePath)) {
    Write-Fail "Carpeta mobile/ no encontrada."
    exit 1
}

Push-Location $mobilePath
Write-Info "Ejecutando: npm install en mobile/"
try {
    npm install
    Write-Success "Mobile - dependencias instaladas correctamente."
} catch {
    Write-Fail "Fallo al instalar dependencias de la app movil: $_"
    Pop-Location
    exit 1
}
Pop-Location

Write-Host ""

# ---- .env Setup ----
Write-Step "Verificando archivo .env del backend..."
$envPath = Join-Path $backendPath ".env"
$envExamplePath = Join-Path $backendPath ".env.example"

if (-not (Test-Path $envPath)) {
    if (Test-Path $envExamplePath) {
        Copy-Item $envExamplePath $envPath
        Write-Success "Archivo backend/.env creado a partir de .env.example"
        Write-Warn "Edita backend/.env con tus valores reales antes de iniciar el servidor."
    } else {
        Write-Warn "No se encontro backend/.env.example. Crea backend/.env manualmente."
    }
} else {
    Write-Success "backend/.env ya existe."
}

Write-Host ""

# ---- Expo CLI check ----
Write-Step "Verificando Expo CLI..."
try {
    $expoVersion = npx expo --version 2>$null
    Write-Success "Expo CLI disponible: $expoVersion"
} catch {
    Write-Warn "Expo CLI no encontrado. Se instalara automaticamente con npx expo start."
}

Write-Host ""

# ---- Done ----
Write-Header "Setup completado!"

Write-Host "  Para iniciar el proyecto:" -ForegroundColor White
Write-Host ""
Write-Host "  1. Backend (PowerShell 1):" -ForegroundColor White
Write-Host "       cd backend" -ForegroundColor Gray
Write-Host "       npm run dev" -ForegroundColor Gray
Write-Host ""
Write-Host "  2. App movil (PowerShell 2):" -ForegroundColor White
Write-Host "       cd mobile" -ForegroundColor Gray
Write-Host "       npx expo start" -ForegroundColor Gray
Write-Host ""
Write-Host "  Usuarios de prueba:" -ForegroundColor White
Write-Host "       admin@bomberos-cbba.bo   / Admin123!" -ForegroundColor Gray
Write-Host "       jefe@bomberos-cbba.bo    / Jefe123!" -ForegroundColor Gray
Write-Host "       bombero@bomberos-cbba.bo / Bombero123!" -ForegroundColor Gray
Write-Host ""
