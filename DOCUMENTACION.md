# Documentación del Proyecto: Sistema de Gestión Logística de Boletas y Viajes

## Descripción General
Este sistema es una arquitectura de microservicios diseñada para gestionar la trazabilidad de cargas industriales (ej. tomate), permitiendo la creación de boletas, asignación de viajes a conductores, y monitoreo en tiempo real por parte de supervisores.

## Arquitectura
El sistema se divide en tres microservicios principales y un frontend moderno:

1.  **Backend User (Puerto 8081)**: Gestiona la autenticación (JWT), roles (ADMINISTRADOR, SUPERVISOR, CHOFER) y perfiles de usuario.
2.  **Backend Boletas (Puerto 8082)**: Núcleo de la lógica de negocio. Gestiona Boletas, Viajes y Reportes.
3.  **Backend Flota (Puerto 8083)**: Gestiona los vehículos y la asociación de conductores a flotas.
4.  **Frontend (Vite + React)**: Interfaz de usuario SPA con soporte para PWA y modo offline parcial.

## Requisitos
- Java 17+
- Node.js 18+
- Docker y Docker Compose (para las bases de datos PostgreSQL)
- Maven 3.9.6+ (incluido en la raíz como `apache-maven-3.9.6`)

## Ejecución Rápida
Para iniciar todo el ecosistema (Bases de datos, Microservicios y Frontend), ejecute el archivo:
```batch
arranque.bat
```
Este script verificará los módulos de node, levantará los contenedores de Docker y lanzará cada servicio en una ventana independiente.

## Flujo de Trabajo
1.  **Administrador**: Crea usuarios y gestiona la configuración global.
2.  **Supervisor**: Crea Boletas de carga, asigna conductores/vehículos y genera reportes PDF/Excel.
3.  **Chofer**: Visualiza sus viajes asignados, acepta el cargo e inicia el viaje digitalmente.
4.  **Trazabilidad**: El supervisor escanea el código QR físico para verificar los datos del viaje y marcar la entrega final.

## Puertos y Endpoints
- **Frontend**: `https://localhost:5173`
- **User API**: `https://localhost:8081/api`
- **Boletas API**: `https://localhost:8082/api`
- **Flota API**: `https://localhost:8083/api`

---
*Desarrollado para el curso de Arquitectura de Sistemas.*
