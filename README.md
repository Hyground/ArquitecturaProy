# Trazabilidad Agrónoma - Sistema de Gestión de Boletas

Sistema integral de trazabilidad logística diseñado para el control de cargas agrícolas, seguimiento en tiempo real de viajes y gestión de boletas digitales con soporte offline.

## 🚀 Arquitectura y Stack

El proyecto utiliza una arquitectura de **Monolito Modular** con una clara separación entre el núcleo de negocio en el backend y una interfaz de usuario reactiva y adaptativa.

- **Backend:** 
  - Spring Boot 3.3
  - Java 21
  - Spring Security + JWT
  - Spring Data JPA (PostgreSQL)
  - Lombok & Maven
- **Frontend:**
  - React 19 + TypeScript
  - Vite (Build Tool)
  - Lucide React (Iconografía)
  - Dexie.js (Soporte Offline / IndexedDB)
  - CSS3 (Vanilla con variables y Flexbox/Grid)
- **Infraestructura:**
  - Docker Ready (Opcional)
  - PostgreSQL 16+

## 🛠️ Funcionalidades Principales

1.  **Gestión de Boletas:** Ciclo de vida completo desde la creación hasta la entrega final.
2.  **QR Inteligente:** Generación dinámica de códigos QR para validación rápida en puntos de control.
3.  **Rastreo GPS:** Captura automática de geolocalización del transporte durante el viaje.
4.  **Soporte Offline-First:** Las operaciones realizadas sin conexión se almacenan localmente y se sincronizan automáticamente al recuperar la red.
5.  **Dashboard Adaptativo:**
    - **PC:** Vista extendida con Sidebar lateral para Administradores.
    - **Móvil:** Interfaz compacta tipo App Nativa con navegación inferior para Choferes.

## 📋 Requisitos Previos

- **Java 21+** instalado.
- **Node.js 20+** instalado.
- **PostgreSQL** configurado con una base de datos llamada `proyectoarq_db`.

## ⚙️ Instalación y Arranque

Para una guía rápida de configuración local, consulte el archivo **`arranque`** en la raíz del proyecto.

1.  **Backend:**
    ```bash
    cd backend
    ./mvnw spring-boot:run
    ```
2.  **Frontend:**
    ```bash
    cd frontend
    npm install
    npm run dev
    ```

## 🔒 Credenciales por Defecto

| Rol | Usuario | Contraseña |
| :--- | :--- | :--- |
| Administrador | `admin@test.com` | `admin123` |
| Supervisor | `supervisor@test.com` | `super123` |
| Chofer | `juan@test.com` | `juan123` |

---
Desarrollado con enfoque en robustez y experiencia de usuario para entornos rurales.
