# AraceliApp - Frontend Architecture

Frontend moderno construido con **React 19**, **Vite**, **TypeScript** y **Tailwind CSS v3**, diseñado bajo principios de **Clean Architecture** (Arquitectura Limpia) con total separación de responsabilidades entre componentes de interfaz y conexiones/servicios.

---

## 📁 Estructura del Proyecto

```text
Frontend/
├── .env                         # Variables de entorno locales (API Base URL, etc.)
├── .env.example                 # Plantilla de variables de entorno
├── package.json                 # Dependencias y scripts del proyecto
├── tailwind.config.js           # Configuración de Tailwind CSS con paleta personalizada
├── postcss.config.js            # Pipeline PostCSS
├── tsconfig.json                # Configuración global TypeScript
├── tsconfig.app.json            # Configuración TypeScript del frontend (paths @/*)
├── vite.config.ts               # Configuración Vite con alias de importación
└── src/
    ├── api/                     # Capa de Red y Configuración HTTP Base
    │   ├── axiosClient.ts       # Cliente Axios con interceptores JWT y formateo de errores
    │   └── index.ts
    │
    ├── constants/               # Constantes globales del sistema
    │   ├── endpoints.ts         # Endpoints centralizados hacia el backend NestJS
    │   ├── routes.ts            # Rutas de navegación de la aplicación
    │   ├── config.ts            # Variables de configuración y claves de storage
    │   └── index.ts
    │
    ├── types/                   # Tipos e Interfaces TypeScript (Entidades y DTOs)
    │   ├── api.types.ts         # Tipado de respuestas estándar, filtros y errores API
    │   ├── user.types.ts        # Interfaces de Usuario, roles, estados y DTOs
    │   ├── auth.types.ts        # Interfaces de sesión, login y tokens JWT
    │   └── index.ts
    │
    ├── services/                # Capa de Conexiones / Servicios (Aislada de React)
    │   ├── user.service.ts      # Peticiones HTTP del módulo de usuarios
    │   ├── auth.service.ts      # Peticiones HTTP del módulo de autenticación
    │   └── index.ts
    │
    ├── hooks/                   # Custom Hooks (Lógica desacoplada y consumo de servicios)
    │   ├── useUsers.ts          # Hook para CRUD de usuarios desacoplado de la UI
    │   ├── useDebounce.ts       # Hook de debounce para búsquedas reactivas
    │   ├── useModal.ts          # Controlador reutilizable de modales
    │   └── index.ts
    │
    ├── context/                 # Estado Global de React
    │   ├── AuthContext.tsx      # Proveedor de sesión y usuario autenticado
    │   ├── NotificationContext.tsx # Sistema global de notificaciones toast
    │   └── index.ts
    │
    ├── components/
    │   ├── common/              # Componentes UI Atómicos y 100% Reutilizables
    │   │   ├── Button.tsx       # Botón con variantes, tamaños, iconos y estado de carga
    │   │   ├── Input.tsx        # Campo de entrada con label, validación e iconos
    │   │   ├── Card.tsx         # Tarjeta modular (Header, Title, Content, Footer)
    │   │   ├── Modal.tsx        # Diálogo accesible con backdrop y escape
    │   │   ├── Table.tsx        # Tabla tipada y genérica con estados de carga y vacío
    │   │   ├── Badge.tsx        # Etiquetas de estado (éxito, aviso, peligro, etc.)
    │   │   ├── Spinner.tsx      # Indicador de carga animado
    │   │   └── index.ts
    │   │
    │   ├── layout/              # Componentes de Estructura y Navegación
    │   │   ├── Navbar.tsx       # Barra superior con buscador y perfil
    │   │   ├── Sidebar.tsx      # Menú lateral responsivo y drawer móvil
    │   │   ├── Footer.tsx       # Pie de página
    │   │   ├── MainLayout.tsx   # Ensamblador de vistas y layout principal
    │   │   └── index.ts
    │   │
    │   └── feedback/            # Retroalimentación visual
    │       ├── Alert.tsx        # Mensajes de aviso, éxito o error
    │       ├── EmptyState.tsx   # Estado vacío con llamada a la acción
    │       └── index.ts
    │
    ├── pages/                   # Vistas / Pantallas principales
    │   ├── Dashboard/           # Vista de resumen, métricas y accesos
    │   ├── Users/               # Vista de gestión de usuarios con tabla y modales
    │   ├── NotFound/            # Pantalla 404
    │   └── index.ts
    │
    ├── utils/                   # Utilidades y funciones puras
    │   ├── storage.ts           # Wrapper tipado y seguro de localStorage
    │   ├── formatters.ts        # Formateadores de fechas e iniciales
    │   ├── validators.ts        # Validaciones de formulario
    │   └── index.ts
    │
    ├── App.tsx                  # Enrutador principal y montaje de proveedores
    ├── main.tsx                 # Punto de entrada de React
    └── index.css                # Directivas de Tailwind y estilos globales
```

---

## 🧩 Separación de Responsabilidades: Componentes vs Conexiones

Esta estructura garantiza que **los componentes de interfaz nunca llamen directamente a Axios o Fetch**:

1. **`src/services/`**: Única capa encargada del protocolo HTTP, URL base, cabeceras y llamadas a la API de NestJS.
2. **`src/hooks/`**: Intermediario reactivo. Consume los servicios, gestiona estados (`loading`, `error`, `data`) y expone funciones simples (`createUser`, `updateUser`, etc.).
3. **`src/components/`**: Componentes puramente visuales y agnósticos al origen de los datos. Reciben props o consumen los hooks.

---

## 🚀 Cómo Ejecutar el Proyecto

```bash
# Instalar dependencias (ya completado)
npm install

# Iniciar servidor de desarrollo local
npm run dev

# Compilar para producción
npm run build
```
