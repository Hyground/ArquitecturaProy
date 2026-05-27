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

:: 2. Recordatorio de Base de Datos
echo.
echo [ATENCION] Asegurate de que PostgreSQL este CORRIENDO en el puerto 5432.
echo [ATENCION] Debes haber creado las siguientes bases de datos manualmente:
echo    - backend_user_db
echo    - backend_boletas_db
echo    - backend_flota_db
echo.
echo Si no las has creado, los backends fallaran al iniciar.
echo.
pause

echo ========================================
echo   INICIANDO MICROSERVICIOS
echo ========================================

:: Iniciar User Core
echo [+] Iniciando Backend User (8081)...
start "Backend-User" cmd /k "cd /d "%PROJECT_ROOT%backend-user" && "%MVN_BIN%" spring-boot:run"

timeout /t 8 /nobreak > nul

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
pause
