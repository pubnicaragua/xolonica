# 📘 Guía de Configuración de Supabase para Xolonica.store

Esta guía te ayudará a configurar completamente tu proyecto de Supabase para Xolonica.store.

## ✅ Paso 1: Ejecutar el Schema SQL

1. **Accede a tu proyecto de Supabase**
   - URL: https://supabase.com/dashboard
   - Proyecto: `mptnhektozvjowoydjha`

2. **Abre el SQL Editor**
   - En el menú lateral, haz clic en "SQL Editor"
   - Clic en "New Query"

3. **Copia y pega el schema**
   - Abre el archivo `/supabase/migrations/001_initial_schema.sql`
   - Copia TODO el contenido
   - Pégalo en el editor SQL de Supabase

4. **Ejecuta el script**
   - Haz clic en "Run" o presiona `Ctrl/Cmd + Enter`
   - Verifica que no haya errores

5. **Verifica la creación de tablas**
   - Ve a "Table Editor" en el menú lateral
   - Deberías ver las siguientes tablas:
     * `businesses`
     * `products`
     * `reviews`
     * `chat_messages`
     * `user_profiles`

6. **Verifica los datos de ejemplo**
   - Abre la tabla `businesses`
   - Deberías ver 3 negocios:
     * Gorras Nicaragua
     * COMINSA
     * Heydi MakeUp
   - Abre la tabla `products`
   - Deberías ver 6 productos (2 por cada negocio)

## ✅ Paso 2: Configurar Autenticación

1. **Accede a Authentication**
   - En el menú lateral, haz clic en "Authentication"
   - Luego "Providers"

2. **Configurar Email Auth**
   - Email Provider debería estar **habilitado** por defecto
   - En "Email Auth", configura:
     * ✅ Enable Email provider
     * ✅ Confirm email: **DESACTIVADO** (para prototipo rápido)
     * ✅ Enable Email Confirmations: **DESACTIVADO**

3. **Verificar configuración**
   - Prueba crear un usuario desde la app para verificar que funciona

## ✅ Paso 3: Configurar Storage (Opcional - Para Imágenes)

**Nota**: En el MVP actual, no se cargan imágenes, pero puedes configurarlo para futuras versiones.

1. **Crear bucket para logos de negocios**
   - Ve a "Storage" en el menú lateral
   - Clic en "Create Bucket"
   - Nombre: `business-logos`
   - Público: **No** (privado)

2. **Crear bucket para productos**
   - Clic en "Create Bucket"
   - Nombre: `product-images`
   - Público: **No** (privado)

3. **Configurar políticas de Storage** (opcional)
   ```sql
   -- Policy para permitir subida de logos
   CREATE POLICY "Authenticated users can upload business logos"
   ON storage.objects FOR INSERT
   TO authenticated
   WITH CHECK (bucket_id = 'business-logos');

   -- Policy para permitir lectura de logos
   CREATE POLICY "Anyone can view business logos"
   ON storage.objects FOR SELECT
   TO public
   USING (bucket_id = 'business-logos');
   ```

## ✅ Paso 4: Configurar Realtime (Para Chat)

1. **Verificar que Realtime esté habilitado**
   - Ve a "Database" → "Replication"
   - Asegúrate de que la tabla `chat_messages` esté habilitada para Realtime

2. **Habilitar Realtime para chat_messages**
   - En "Database" → "Replication"
   - Busca la tabla `chat_messages`
   - Activa el toggle para habilitarla

## ✅ Paso 5: Verificar Row Level Security (RLS)

Todas las políticas RLS ya están incluidas en el schema SQL. Verifica que estén activas:

1. **Ve a Table Editor**
2. **Para cada tabla, verifica RLS**:
   - `businesses`: RLS habilitado ✅
   - `products`: RLS habilitado ✅
   - `reviews`: RLS habilitado ✅
   - `chat_messages`: RLS habilitado ✅
   - `user_profiles`: RLS habilitado ✅

## ✅ Paso 6: Verificar las Credenciales

Las credenciales ya están configuradas en `/utils/supabase/client.ts`:

```typescript
const supabaseUrl = 'https://mptnhektozvjowoydjha.supabase.co';
const supabaseAnonKey = 'eyJhbGci...'; // Tu API Key
```

**NO COMPARTAS** la Service Role Key públicamente. Solo úsala en el backend si es necesario.

## 🧪 Paso 7: Prueba la Configuración

### 7.1 Verificar que los datos existan

Ejecuta esta consulta en SQL Editor:

```sql
SELECT 
  b.name as negocio,
  COUNT(p.id) as productos
FROM businesses b
LEFT JOIN products p ON p.business_id = b.id
GROUP BY b.id, b.name;
```

Deberías ver:
- Gorras Nicaragua: 2 productos
- COMINSA: 2 productos
- Heydi MakeUp: 2 productos

### 7.2 Probar autenticación

1. Ejecuta la app: `npm run dev`
2. Haz clic en "Entrar"
3. Crea una cuenta de prueba
4. Verifica que puedas iniciar sesión

### 7.3 Probar funcionalidades

- ✅ Ver listado de negocios
- ✅ Ver perfil de un negocio
- ✅ Dejar una reseña (requiere login)
- ✅ Enviar mensaje en chat (requiere login)
- ✅ Registrar un nuevo negocio

## 🔧 Troubleshooting

### Error: "relation businesses does not exist"
**Solución**: El schema no se ejecutó correctamente. Vuelve a ejecutar el SQL del Paso 1.

### Error: "new row violates row-level security policy"
**Solución**: Las políticas RLS están muy restrictivas. Verifica que las políticas en el schema se hayan creado correctamente.

### No aparecen los negocios de ejemplo
**Solución**: 
1. Ve a SQL Editor
2. Ejecuta: `SELECT * FROM businesses;`
3. Si está vacío, vuelve a ejecutar solo la sección de INSERT del schema

### El chat no funciona en tiempo real
**Solución**: 
1. Verifica que Realtime esté habilitado para `chat_messages`
2. Ve a Database → Replication
3. Habilita la tabla `chat_messages`

## 📊 Datos de Ejemplo Incluidos

### Negocios (3)

1. **Gorras Nicaragua**
   - Categoría: Comercio - Ropa y Accesorios
   - Ciudad: Managua
   - Estado: Verificado
   - Productos: Gorra Clásica Bordada, Gorra Snapback Premium

2. **COMINSA**
   - Categoría: Ferretería y Construcción
   - Ciudad: Managua
   - Estado: Verificado
   - Productos: Cemento Portland 50kg, Hierro Corrugado 3/8"

3. **Heydi MakeUp**
   - Categoría: Belleza y Cuidado Personal
   - Ciudad: Managua
   - Estado: Verificado
   - Productos: Maquillaje para Novia, Maquillaje Social

## ⚡ Optimizaciones Recomendadas

1. **Índices**: Ya están creados en el schema para optimizar consultas
2. **Triggers**: Considera agregar triggers para:
   - Actualizar `updated_at` automáticamente en businesses
   - Notificaciones cuando un negocio sea verificado

3. **Funciones Edge** (Futuro): 
   - Procesamiento de pagos
   - Verificación automática de datos
   - Envío de emails

## 🎯 Próximos Pasos

Una vez configurado todo:

1. ✅ Ejecuta `npm run dev` para iniciar la aplicación
2. ✅ Navega a http://localhost:3000
3. ✅ Explora los 3 negocios de ejemplo
4. ✅ Crea una cuenta de usuario de prueba
5. ✅ Deja una reseña en un negocio
6. ✅ Prueba el chat en tiempo real
7. ✅ Registra un negocio nuevo

## 📞 Soporte

Si encuentras problemas:
1. Revisa los logs de Supabase en el Dashboard
2. Verifica que todas las tablas tengan RLS habilitado
3. Asegúrate de que las políticas RLS permitan las operaciones necesarias

---

**¡Configuración completada! 🎉**

Tu plataforma Xolonica.store está lista para usar.
