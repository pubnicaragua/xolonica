# 🚀 INSTRUCCIONES COMPLETAS - XOLONICA.STORE

## ✅ NUEVAS FUNCIONALIDADES IMPLEMENTADAS

### 1. **Chatbot General con IA (Groq)**
- Chatbot flotante en todas las páginas
- Contexto completo de Xolonica
- Respuestas en tiempo real con IA

### 2. **Chat en Tiempo Real con Negocios**
- Sistema de mensajería bidireccional
- Actualización en tiempo real con Supabase Realtime
- Los negocios pueden responder a sus clientes

### 3. **Buscador de Productos Global**
- Búsqueda full-text en español
- Resultados de todos los negocios
- Filtrado por relevancia

### 4. **Sistema de Estrellas de Verificación (Gamificación)**
- ⭐ 1 Estrella: Verificación básica con nombre
- ⭐⭐ 2 Estrellas: Cédula verificada con foto
- ⭐⭐⭐ 3 Estrellas: Tienda física + RUC + cuenta bancaria

### 5. **Panel de Administración**
- Gestión de negocios pendientes
- Aprobar/Rechazar negocios
- Ver estadísticas globales
- Control de límite de productos (10 por negocio)

---

## 📋 PASO 1: EJECUTAR SQL EN SUPABASE

1. Ve a tu proyecto en Supabase: https://supabase.com/dashboard
2. Abre el **SQL Editor**
3. Copia y pega **TODO** el contenido del archivo `supabase-migrations.sql`
4. Haz clic en **Run** (Ejecutar)
5. Verifica que aparezca: "Migración completada exitosamente"

---

## 👤 PASO 2: CREAR TU USUARIO ADMIN

1. Regístrate en la aplicación con tu email
2. Ve al SQL Editor de Supabase
3. Ejecuta este SQL (reemplaza con tu email):

```sql
INSERT INTO admins (user_id, email)
SELECT id, email FROM auth.users WHERE email = 'TU-EMAIL@ejemplo.com'
ON CONFLICT (user_id) DO NOTHING;
```

4. Ahora podrás acceder a: `http://localhost:3000/admin`

---

## 🖼️ PASO 3: ACTUALIZAR EL LOGO

El logo ya está configurado para usar: `C:\Users\Probook 450 G7\Downloads\Xolonica\Logo.png`

Para que aparezca en la app:

1. Copia tu logo a: `src/public/logo.png`
2. O actualiza la ruta en `src/components/Navbar.tsx` línea 42

---

## 🚀 PASO 4: INICIAR EL SERVIDOR

```bash
cd "c:\Users\Probook 450 G7\Downloads\Xolonica\src"
npm run dev
```

El servidor estará en: **http://localhost:3000**

---

## 🎯 RUTAS DISPONIBLES

### Públicas:
- `/` - Home
- `/negocios` - Directorio de negocios
- `/buscar-productos` - Buscador de productos
- `/negocios/[id]` - Detalle de negocio (con chat en tiempo real)
- `/registrar-negocio` - Registro de negocios

### Protegidas:
- `/admin` - Panel de administración (solo admins)
- `/mi-cuenta` - Cuenta del usuario

---

## 🔑 FUNCIONALIDADES CLAVE

### Chatbot General
- Botón flotante en la esquina inferior derecha
- Responde preguntas sobre Xolonica
- Ayuda a encontrar negocios y productos

### Chat con Negocios
- En la página de detalle de cada negocio
- Mensajes en tiempo real
- Los negocios pueden responder desde su cuenta

### Buscador de Productos
- Busca por nombre o descripción
- Muestra productos de todos los negocios
- Click en un producto lleva al negocio

### Sistema de Verificación
- Los negocios empiezan con 1 estrella
- Pueden subir a 2 estrellas verificando cédula
- Llegan a 3 estrellas con tienda física y RUC

### Panel de Admin
- Ver todos los negocios pendientes
- Aprobar o rechazar negocios
- Ver estadísticas globales
- Controlar que no excedan 10 productos

---

## 📊 TABLAS CREADAS EN SUPABASE

1. `business_messages` - Mensajes de chat con negocios
2. `chatbot_conversations` - Conversaciones del chatbot
3. `admins` - Administradores de la plataforma
4. `products_with_business` (vista) - Productos con info del negocio
5. `admin_stats` (vista) - Estadísticas para el panel

### Columnas Agregadas a `businesses`:
- `verification_level` (1-3 estrellas)
- `cedula_verified`
- `cedula_photo_url`
- `has_physical_store`
- `ruc`
- `bank_account_name`
- `product_count`

### Columnas Agregadas a `products`:
- `search_vector` (para búsqueda full-text)

---

## 🔧 CONFIGURACIÓN DE GROQ AI

La API key ya está configurada en: `src/services/groq.ts`

**API Key:** `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`

⚠️ **IMPORTANTE:** En producción, mueve esta key a variables de entorno.

---

## ✨ CÓMO PROBAR TODO

### 1. Chatbot General
- Abre cualquier página
- Click en el botón flotante azul (esquina inferior derecha)
- Pregunta: "¿Cómo funciona Xolonica?"

### 2. Chat con Negocios
- Ve a `/negocios`
- Click en cualquier negocio
- Scroll hasta "Contacta al Negocio"
- Envía un mensaje (necesitas estar logueado)

### 3. Buscador de Productos
- Click en "Buscar Productos" en el navbar
- Busca: "licuadora" o cualquier producto
- Los resultados se actualizan en tiempo real

### 4. Sistema de Estrellas
- Ve a cualquier negocio
- Verás las estrellas de verificación en el header
- También aparecen en las cards del directorio

### 5. Panel de Admin
- Regístrate con tu email
- Ejecuta el SQL para hacerte admin (Paso 2)
- Ve a `/admin`
- Aprueba/rechaza negocios pendientes

---

## 🎨 MEJORAS DE UI IMPLEMENTADAS

- ✅ Navbar moderno con blur y sombra
- ✅ Hero con degradado y elementos decorativos
- ✅ Cards con sombras y hover effects
- ✅ Sistema de colores consistente (azul/amarillo/verde)
- ✅ Tipografía mejorada y jerarquía visual
- ✅ 100% responsive en todos los dispositivos
- ✅ Animaciones suaves en transiciones

---

## 📝 NOTAS IMPORTANTES

1. **Límite de Productos:** Cada negocio puede tener máximo 10 productos
2. **Chat en Tiempo Real:** Usa Supabase Realtime (sin costo adicional)
3. **Búsqueda de Productos:** Usa PostgreSQL full-text search
4. **Verificación:** Los negocios pueden solicitar subir de nivel
5. **Pagos:** Xolonica NO procesa pagos, solo conecta clientes con negocios

---

## 🐛 SOLUCIÓN DE PROBLEMAS

### El chatbot no responde
- Verifica que instalaste `groq-sdk`: `npm install`
- Revisa la consola del navegador para errores

### El chat en tiempo real no funciona
- Verifica que ejecutaste el SQL en Supabase
- Revisa que RLS esté habilitado en `business_messages`

### No puedo acceder a /admin
- Verifica que ejecutaste el SQL para hacerte admin
- Cierra sesión y vuelve a iniciar

### La búsqueda de productos no funciona
- Verifica que ejecutaste el SQL completo
- Revisa que exista la función `search_products` en Supabase

---

## 📞 SOPORTE

Si algo no funciona:
1. Revisa la consola del navegador (F12)
2. Revisa los logs del servidor en la terminal
3. Verifica que todas las migraciones de Supabase se ejecutaron

---

## 🎉 ¡LISTO!

Tu plataforma Xolonica.store ahora tiene:
- ✅ Chatbot con IA
- ✅ Chat en tiempo real
- ✅ Buscador de productos
- ✅ Sistema de verificación gamificado
- ✅ Panel de administración
- ✅ UI moderna y responsive

**¡Disfruta tu plataforma!** 🚀
