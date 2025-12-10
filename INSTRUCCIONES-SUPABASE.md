# 📋 Instrucciones para Configurar Supabase - Xolonica.store

## ✅ Checklist Rápido

- [ ] Ejecutar SQL principal (`supabase-setup.sql`)
- [ ] Verificar/crear buckets de Storage
- [ ] Configurar políticas de Storage
- [ ] Habilitar Realtime
- [ ] Probar funcionalidades

---

## 1️⃣ Ejecutar el SQL Principal

1. Abre tu proyecto en Supabase Dashboard
2. Ve a **SQL Editor** (icono de base de datos en el menú lateral)
3. Click en **New Query**
4. Copia y pega todo el contenido de `supabase-setup.sql`
5. Click en **Run** (o presiona `Ctrl/Cmd + Enter`)
6. Verifica que no haya errores en la consola

---

## 2️⃣ Configurar Storage Buckets

### Verificar si los buckets existen

1. Ve a **Storage** en el menú lateral
2. Verifica que existan estos buckets:
   - `business-logos`
   - `product-images`

### Si NO existen, créalos:

#### Crear bucket `business-logos`:

1. Click en **New bucket**
2. **Name**: `business-logos`
3. **Public bucket**: ✅ Activado
4. Click **Create bucket**

#### Crear bucket `product-images`:

1. Click en **New bucket**
2. **Name**: `product-images`
3. **Public bucket**: ✅ Activado
4. Click **Create bucket**

---

## 3️⃣ Configurar Políticas de Storage

### Para `business-logos`:

1. Click en el bucket `business-logos`
2. Ve a la pestaña **Policies**
3. Click **New Policy**

#### Política 1: Lectura pública (SELECT)

- **Policy name**: `Public Access`
- **Allowed operation**: `SELECT`
- **Target roles**: `public`
- **Policy definition**:
  ```sql
  bucket_id = 'business-logos'
  ```
- Click **Save**

#### Política 2: Upload para usuarios autenticados (INSERT)

- Click **New Policy**
- **Policy name**: `Authenticated users can upload`
- **Allowed operation**: `INSERT`
- **Target roles**: `authenticated`
- **Policy definition**:
  ```sql
  bucket_id = 'business-logos'
  ```
- Click **Save**

#### Política 3: Update para usuarios autenticados

- Click **New Policy**
- **Policy name**: `Authenticated users can update`
- **Allowed operation**: `UPDATE`
- **Target roles**: `authenticated`
- **Policy definition**:
  ```sql
  bucket_id = 'business-logos'
  ```
- Click **Save**

### Para `product-images`:

Repite exactamente los mismos pasos pero cambiando `business-logos` por `product-images` en las políticas.

---

## 4️⃣ Habilitar Realtime

### Para `business_messages` (Chat en tiempo real):

1. Ve a **Database** > **Replication**
2. Busca la tabla `business_messages`
3. Activa el toggle de **Realtime** (debe ponerse verde)
4. Click **Save** si aparece

### Para `reviews` (Opcional - reseñas en tiempo real):

1. Busca la tabla `reviews`
2. Activa el toggle de **Realtime**
3. Click **Save** si aparece

---

## 5️⃣ Verificar Configuración

### Verificar buckets:

Ejecuta en SQL Editor:

```sql
SELECT * FROM storage.buckets 
WHERE name IN ('business-logos', 'product-images');
```

Deberías ver 2 filas con `public = true`.

### Verificar políticas de Storage:

```sql
SELECT * FROM storage.policies 
WHERE bucket_id IN ('business-logos', 'product-images');
```

Deberías ver al menos 6 políticas (3 por cada bucket).

### Verificar Realtime:

```sql
SELECT schemaname, tablename 
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime';
```

Deberías ver `business_messages` y opcionalmente `reviews`.

---

## 6️⃣ Probar la Aplicación

### Test 1: Registro de Usuario

1. Abre la app en el navegador
2. Click en **Entrar** > **Crear Cuenta**
3. Completa el formulario (verifica que el teléfono tenga la bandera 🇳🇮 y +505)
4. Registra el usuario
5. Verifica en Supabase > **Authentication** > **Users** que el usuario se creó

### Test 2: Registro de Negocio

1. Inicia sesión con el usuario creado
2. Ve a `/registrar-negocio`
3. Completa los 3 pasos:
   - **Paso 1**: Datos del negocio (verifica bandera en teléfonos, completa al menos Facebook o Instagram)
   - **Paso 2**: Descripción y logo (sube una imagen y verifica que se vea el preview)
   - **Paso 3**: Productos (sube imágenes y verifica previews)
4. Envía el formulario
5. **Abre la consola del navegador** (F12) y verifica los logs:
   - `📤 Subiendo logo...`
   - `✅ Logo subido: [URL]`
   - `📤 Subiendo imagen del producto 1...`
   - `✅ Imagen del producto 1 subida: [URL]`

### Test 3: Verificar imágenes en Storage

1. Ve a Supabase > **Storage** > `business-logos`
2. Deberías ver una carpeta con el ID del negocio
3. Dentro debe estar el logo
4. Ve a **Storage** > `product-images`
5. Deberías ver las imágenes de productos con marca de agua

### Test 4: Búsqueda de Productos

1. Ve a `/buscar-productos`
2. Escribe algo en el buscador
3. Verifica que aparezcan sugerencias mientras escribes
4. Borra el texto y verifica que vuelvan a aparecer "Productos recientes"

### Test 5: Reseñas

1. Ve a la página de un negocio `/negocios/[id]`
2. Click en **Escribir Reseña**
3. Completa y envía
4. Si hay error, verás un alert con el mensaje específico
5. Si funciona, la reseña debe aparecer inmediatamente

### Test 6: Chat Flotante

1. En la página de un negocio, verifica que aparezca el botón flotante de chat (abajo a la derecha)
2. Click en el botón
3. Escribe un mensaje
4. Abre la misma página en otra ventana/navegador (o en modo incógnito con otro usuario)
5. Verifica que los mensajes lleguen en tiempo real
6. Minimiza el chat y envía un mensaje desde la otra ventana
7. Verifica que aparezca el contador de mensajes no leídos

---

## 🔧 Solución de Problemas

### Las imágenes no se suben

**Síntoma**: Aparece alert "Error al subir el logo: ..." o "Error al subir imagen del producto..."

**Solución**:

1. Verifica que los buckets existan y sean públicos
2. Verifica que las políticas de INSERT estén configuradas
3. Revisa la consola del navegador para ver el error exacto
4. Ejecuta en SQL:
   ```sql
   SELECT * FROM storage.policies WHERE bucket_id = 'business-logos';
   ```

### Las reseñas no se guardan

**Síntoma**: Alert "Error al publicar la reseña: new row violates row-level security policy"

**Solución**:

1. Verifica que ejecutaste la sección 1 del SQL (Políticas RLS para reviews)
2. Ejecuta en SQL:
   ```sql
   SELECT * FROM pg_policies WHERE tablename = 'reviews';
   ```
3. Deberías ver al menos 2 políticas

### El chat no funciona en tiempo real

**Síntoma**: Los mensajes no aparecen automáticamente, hay que recargar

**Solución**:

1. Verifica que Realtime esté habilitado para `business_messages`
2. Ve a **Database** > **Replication** y activa el toggle
3. Ejecuta en SQL:
   ```sql
   SELECT * FROM pg_publication_tables 
   WHERE pubname = 'supabase_realtime' AND tablename = 'business_messages';
   ```

### Error "permission denied for table..."

**Solución**:

1. Verifica que RLS esté habilitado en la tabla
2. Ejecuta las políticas correspondientes del SQL
3. Si persiste, ejecuta:
   ```sql
   ALTER TABLE [nombre_tabla] ENABLE ROW LEVEL SECURITY;
   ```

---

## 📞 Siguiente Paso

Una vez que todo funcione:

1. ✅ Marca todas las casillas del checklist
2. 🎉 La aplicación está lista para usar
3. 📊 Puedes empezar a probar el flujo completo de negocio

---

## 🚀 Funcionalidades Implementadas

- ✅ Registro de usuario con teléfono +505 y bandera 🇳🇮
- ✅ Validación flexible de redes sociales (Facebook o Instagram)
- ✅ Subida de imágenes con previews y marca de agua
- ✅ Búsqueda de productos con autocomplete en tiempo real
- ✅ Estrellas de verificación con explicación (x/3)
- ✅ Buscador que se reinicia al borrar texto
- ✅ Reseñas con manejo de errores mejorado
- ✅ Chat flotante tipo Messenger con notificaciones en tiempo real
- ✅ Panel de admin para aprobar/rechazar negocios

---

**¿Necesitas ayuda?** Revisa los logs de la consola del navegador (F12) y los errores de Supabase en el Dashboard.
