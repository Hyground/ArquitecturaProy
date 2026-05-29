@echo off
set "PROJECT_ROOT=%~dp0"
set "MVN_BIN=%PROJECT_ROOT%apache-maven-3.9.6\bin\mvn.cmd"

echo ========================================
echo   VERIFICACION DE REQUISITOS
echo ========================================

:: 1. Verificar Node Modules
if not exist "%PROJECT_ROOT%frontend\node_modules\" (
    echo [!] node_modules no detectado en frontend. Instalando...
    cd /d "%PROJECT_ROOT%frontend"
    call npm install
    cd /d "%PROJECT_ROOT%"
)

:: 2. Levantar Bases de Datos con Docker
echo.
echo [+] Levantando bases de datos en Docker...
docker-compose up -d

if %ERRORLEVEL% NEQ 0 (
    echo [!] Reintentando con 'docker compose'...
    docker compose up -d
)

if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] No se pudo iniciar Docker Compose. Asegurate de que Docker este instalado y corriendo.
    pause
    exit /b %ERRORLEVEL%
)

echo.
echo [+] Esperando a que las bases de datos esten listas...
:wait_for_db
docker inspect -f {{.State.Health.Status}} proyecto-postgres 2>nul | findstr "healthy" > nul
if %ERRORLEVEL% NEQ 0 (
    echo [.] Esperando a PostgreSQL...
    timeout /t 3 /nobreak > nul
    goto wait_for_db
)
echo [+] Bases de datos listas y saludables.

echo.
echo ========================================
echo   INICIANDO MICROSERVICIOS
echo ========================================

:: Iniciar User Core
echo [+] Iniciando Backend User (8081)...
start "Backend-User" cmd /k "cd /d "%PROJECT_ROOT%backend-user" && "%MVN_BIN%" spring-boot:run"

timeout /t 5 /nobreak > nul

:: Iniciar Boletas
echo [+] Iniciando Backend Boletas (8082)...
start "Backend-Boletas" cmd /k "cd /d "%PROJECT_ROOT%backend-boletas" && "%MVN_BIN%" spring-boot:run"

timeout /t 5 /nobreak > nul

:: Iniciar Flota
echo [+] Iniciando Backend Flota (8083)...
start "Backend-Flota" cmd /k "cd /d "%PROJECT_ROOT%backend-flota" && "%MVN_BIN%" spring-boot:run"

:: Iniciar Frontend
echo [+] Iniciando Frontend (Vite)...
start "Frontend" cmd /k "cd /d "%PROJECT_ROOT%frontend" && call npm run dev"

echo.
echo ========================================
echo   SISTEMA EN MARCHA
echo ========================================
echo.
echo Puedes acceder a:
echo - Frontend: https://192.168.1.17:5173 (o el puerto que asigne Vite)
echo - Backend User: https://192.168.1.17:8081
echo - Backend Boletas: https://192.168.1.17:8082
echo - Backend Flota: https://192.168.1.17:8083
echo.
pause
