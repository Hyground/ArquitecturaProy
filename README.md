# ProyectoArq - Gestión y Trazabilidad de Carga

Este proyecto es un sistema de trazabilidad logística que permite gestionar boletas digitales, seguimiento mediante GPS y escaneo de códigos QR, con soporte offline-first para trabajadores en campo.

## Arquitectura
- **Backend:** Spring Boot 3 + PostgreSQL.
- **Frontend:** React (Vite) + TypeScript + Dexie (IndexedDB).

## Requisitos
- Java 21+
- Node.js 18+
- PostgreSQL (Base de datos: `proyectoarq_db`)

## Instalación y Ejecución Paso a Paso

### 1. Preparar la Base de Datos (PostgreSQL)
Asegúrate de tener PostgreSQL instalado y en ejecución. Crea la base de datos requerida:
```sql
CREATE DATABASE proyectoarq_db;
```
*Nota: El backend creará las tablas automáticamente al iniciar (hibernate ddl-auto: update).*

### 2. Levantar el Backend (Spring Boot)
Abre una terminal en la carpeta raíz del proyecto y ejecuta:
```powershell
cd backend
# Si 'mvn' no está en tu PATH, usa la ruta absoluta:
& "C:\Users\hygro\.m2\wrapper\dists\apache-maven-3.9.15\0226a00282e400185496f3b60ec5a3f029cbdc6893912937d4876d57695224e1\bin\mvn.cmd" spring-boot:run
```
El servidor estará disponible en: `http://localhost:8080`

### 3. Levantar el Frontend (React + Vite)
Abre **otra** terminal en la carpeta raíz del proyecto y ejecuta:
```bash
cd frontend
npm install
npm run dev
```
La aplicación estará disponible en: `http://localhost:5173`

---

## Credenciales de Prueba
El sistema se inicia con los siguientes usuarios precargados para pruebas:

| Rol | Usuario (Email) | Contraseña |
| :--- | :--- | :--- |
| **Administrador** | `admin@test.com` | `admin123` |
| **Supervisor** | `supervisor@test.com` | `super123` |
| **Chofer** | `juan@test.com` | `juan123` |

---

## Funcionalidades Clave
- **Autenticación JWT:** Roles diferenciados para cada tipo de usuario.
- **Gestión de Boletas:** Creación, edición y consulta de guías de carga.
- **QR Dinámico:** Generación automática de QR por cada boleta para escaneo en puntos de control.
- **Modo Offline:** Soporte para trabajar sin internet (Dexie/IndexedDB) y sincronización posterior.
- **GPS Tracking:** Seguimiento en tiempo real de la ubicación del viaje.
- **Reportes:** Generación de resúmenes de actividad.

## Validación (Tracer Bullet)
Se ha incluido un test de integración en `backend/src/test/java/com/proyectoarq/TracerBulletTest.java` que valida el flujo completo de autenticación, creación de boletas y generación de QR.
