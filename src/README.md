# Xolonica.store - Negocios Verificados en Nicaragua 🇳🇮

Plataforma web moderna, rápida y escalable que conecta negocios verificados con clientes en Nicaragua.

## 🚀 Características Principales

- **Para Negocios**: Registro y verificación de negocios con hasta 10 productos
- **Para Usuarios**: Navegación sin registro, reseñas y chat con autenticación
- **Verificación**: Sistema de validación de negocios por el equipo Xolonica
- **Chat en Tiempo Real**: Comunicación directa entre usuarios y negocios
- **Responsive Design**: Optimizado para móviles (mobile-first)

## 🛠️ Tecnologías Utilizadas

- **Frontend**: Next.js 14 (App Router), React, TypeScript
- **Estilos**: TailwindCSS 4.0
- **Backend**: Supabase (Auth, Database, Storage, Realtime)
- **Optimización**: SSG/ISR para máximo rendimiento
- **Iconos**: Lucide React

## 📋 Requisitos Previos

- Node.js 18+ 
- Cuenta de Supabase
- npm o yarn

## 🔧 Instalación y Configuración

### 1. Clonar e Instalar Dependencias

```bash
npm install
```

### 2. Configurar Supabase Database

Ejecuta el script SQL en el Editor SQL de Supabase:

1. Ve a tu proyecto en https://supabase.com
2. Navega a **SQL Editor**
3. Copia y pega el contenido de `/supabase/migrations/001_initial_schema.sql`
4. Ejecuta el script

Esto creará:
- Tablas: businesses, products, reviews, chat_messages, user_profiles
- Políticas de RLS (Row Level Security)
- Índices para optimización
- 3 negocios de ejemplo:
  - **Gorras Nicaragua** - Ropa y Accesorios
  - **COMINSA** - Ferretería y Construcción
  - **Heydi MakeUp** - Belleza y Cuidado Personal

### 3. Configurar Storage (Opcional)

Para habilitar la carga de imágenes:

1. En Supabase Dashboard, ve a **Storage**
2. Crea un bucket llamado `business-images`
3. Configura las políticas de acceso según sea necesario

### 4. Ejecutar en Desarrollo

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## 📁 Estructura del Proyecto

```
/
├── app/
│   ├── layout.tsx                    # Layout principal
│   ├── page.tsx                      # Landing page (SSG)
│   ├── negocios/
│   │   ├── page.tsx                  # Directorio de negocios
│   │   └── [id]/page.tsx            # Perfil de negocio (ISR)
│   ├── registrar-negocio/page.tsx   # Formulario de registro
│   └── mi-cuenta/page.tsx           # Dashboard del usuario
├── components/
│   ├── Navbar.tsx                    # Navegación principal
│   ├── Footer.tsx                    # Pie de página
│   ├── AuthModal.tsx                 # Modal de login/registro
│   ├── BusinessCard.tsx              # Card de negocio
│   ├── ProductCard.tsx               # Card de producto
│   ├── ReviewsList.tsx               # Lista de reseñas
│   └── ChatWidget.tsx                # Widget de chat en tiempo real
├── utils/
│   └── supabase/client.ts           # Cliente de Supabase
├── types/
│   └── database.ts                   # Tipos TypeScript
├── styles/
│   └── globals.css                   # Estilos globales + CSS Variables
└── supabase/
    └── migrations/
        └── 001_initial_schema.sql    # Schema de base de datos
```

## 🎨 Paleta de Colores Nicaragüense

- **Azul Profundo**: `#003893` - Color principal
- **Azul Claro**: `#0057B7` - Acento
- **Amarillo/Mostaza**: `#F4B942` - Call-to-actions
- **Verde**: `#2D9B4F` - Estados positivos (Verificado)
- **Blanco**: `#FFFFFF` - Fondo principal

## 🔐 Autenticación

La autenticación está manejada por Supabase Auth:

- **Registro**: Email + contraseña + teléfono + nombre
- **Login**: Email + contraseña
- **Sin verificación por código** (configurado para prototipo rápido)

## 📊 Modelo de Datos

### Businesses (Negocios)
- Información del negocio (nombre, categoría, ubicación)
- Contacto (teléfono, email, redes sociales)
- Estado: `pending`, `verified`, `rejected`

### Products (Productos)
- Hasta 10 productos por negocio
- Nombre, descripción, precio, disponibilidad

### Reviews (Reseñas)
- Calificación (1-5 estrellas)
- Comentario
- Requiere autenticación

### Chat Messages (Mensajes)
- Chat en tiempo real con Supabase Realtime
- Requiere autenticación

## 🚀 Optimizaciones de Rendimiento

- **SSG (Static Site Generation)**: Landing page
- **ISR (Incremental Static Regeneration)**: 
  - Home: revalidación cada 1 hora
  - Perfiles de negocio: revalidación cada 30 minutos
- **Lazy Loading**: Imágenes y componentes pesados
- **Mobile-First**: Diseño responsive optimizado para móviles

## 💰 Plan de Suscripción

- **$4.99 USD/mes** por negocio verificado
- Incluye:
  - Perfil verificado
  - Hasta 10 productos
  - Chat con clientes
  - Reseñas ilimitadas

## ⚠️ Nota Importante

**Xolonica no procesa pagos.** La plataforma conecta clientes con negocios verificados, pero todas las transacciones se realizan directamente entre el cliente y el negocio.

## 📝 Próximas Características (Roadmap)

- [ ] Sistema de pagos para suscripción de negocios
- [ ] Carga de imágenes (logos y productos)
- [ ] Panel de administración para verificar negocios
- [ ] Búsqueda avanzada con filtros
- [ ] Notificaciones por email
- [ ] Sistema de favoritos
- [ ] Reportes y analytics para negocios

## 🤝 Contribuir

Este proyecto está en desarrollo activo. Para contribuir:

1. Fork el repositorio
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto es propiedad de Xolonica.store

## 📧 Contacto

Para soporte o consultas: contacto@xolonica.store

---

**Hecho con ❤️ en Nicaragua 🇳🇮**
