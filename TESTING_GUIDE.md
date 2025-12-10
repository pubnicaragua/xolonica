# 🧪 GUÍA DE PRUEBAS - XOLONICA.STORE

## ✅ VERIFICAR QUE TODO FUNCIONA

### 1. **Instalar Dependencias**
```bash
npm install
```

### 2. **Configurar Variables de Entorno**
Crea un archivo `.env.local` en la raíz:
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_GROQ_API_KEY=gsk_your_api_key_here
```

### 3. **Ejecutar Servidor Local**
```bash
npm run dev
```
Abre: `http://localhost:3000`

---

## 🧪 PRUEBAS FUNCIONALES

### **Test 1: Formulario de Registro (3 Pasos)**

1. Ve a `http://localhost:3000/registrar-negocio`
2. **Step 1 - Datos del Negocio**:
   - ✅ Escribe en minúsculas → verifica que capitaliza automáticamente
   - ✅ Selecciona "Tipo de Tienda" (una o ambas opciones)
   - ✅ Llena Facebook e Instagram (obligatorios)
   - ✅ Click "Siguiente"

3. **Step 2 - Descripción**:
   - ✅ Eslogan (máx 100 caracteres)
   - ✅ Descripción (máx 500 caracteres, capitalizada)
   - ✅ Logo (opcional)
   - ✅ Click "Siguiente"

4. **Step 3 - Productos**:
   - ✅ Nombre del producto (capitalizado)
   - ✅ Precio
   - ✅ Descripción
   - ✅ **Imagen** (se agregará marca de agua automáticamente)
   - ✅ Click "Enviar para Verificación"

5. **Resultado esperado**:
   - ✅ Mensaje de éxito
   - ✅ Negocio aparece en BD con `status = 'pending'`
   - ✅ Notificación creada en tabla `notifications`

---

### **Test 2: Admin Panel - Aprobar/Rechazar**

1. **Login como Admin**:
   - Email: `adminileana@gmail.com`
   - Password: `@Managua2024%$`

2. Ve a `http://localhost:3000/admin`

3. **Aprobar Negocio**:
   - ✅ Click en "Aprobar"
   - ✅ Negocio cambia a `status = 'verified'`
   - ✅ Notificación creada: "¡Tu negocio ha sido verificado!"
   - ✅ Aparece en `/negocios`

4. **Rechazar Negocio**:
   - ✅ Click en "Rechazar"
   - ✅ Ingresa razón (opcional)
   - ✅ Negocio cambia a `status = 'rejected'`
   - ✅ Notificación creada: "Tu negocio ha sido rechazado"

---

### **Test 3: Marca de Agua en Imágenes**

1. Sube una imagen en el formulario de registro
2. Verifica en Supabase Storage que la imagen tiene:
   - ✅ Texto "Xolonica.store" en el centro
   - ✅ Semitransparente blanco
   - ✅ Borde azul

---

### **Test 4: Notificaciones**

1. **Registra un negocio** → Notificación de registro
2. **Aprueba desde admin** → Notificación de aprobación
3. **Rechaza desde admin** → Notificación de rechazo

Verifica en Supabase:
```sql
SELECT * FROM notifications ORDER BY created_at DESC LIMIT 10;
```

---

## 🗄️ SQL PARA VERIFICAR

### **Verificar Negocio Registrado**
```sql
SELECT id, name, status, owner_id, has_physical_store, has_online_store 
FROM businesses 
ORDER BY created_at DESC 
LIMIT 1;
```

### **Verificar Notificaciones**
```sql
SELECT user_id, title, message, type, read, created_at 
FROM notifications 
ORDER BY created_at DESC 
LIMIT 10;
```

### **Verificar Productos con Marca de Agua**
```sql
SELECT id, name, image_url, business_id 
FROM products 
WHERE image_url IS NOT NULL 
LIMIT 5;
```

---

## 🐛 TROUBLESHOOTING

### **Error: "npm install" falla**
- Solución: Ejecuta `npm install --legacy-peer-deps`

### **Error: Groq API Key no funciona**
- Verifica que `NEXT_PUBLIC_GROQ_API_KEY` esté en `.env.local`
- Recarga la página

### **Error: Notificaciones no se crean**
- Verifica que la tabla `notifications` existe en Supabase
- Ejecuta `SQL_NOTIFICACIONES.sql`

### **Error: Aprobar/Rechazar no funciona**
- Verifica que eres admin en la tabla `admins`
- Verifica que `owner_id` está en la tabla `businesses`

---

## ✨ CHECKLIST FINAL

- [ ] npm install funciona sin errores
- [ ] Formulario de 3 pasos funciona
- [ ] Capitalización automática funciona
- [ ] Tipo de tienda se guarda correctamente
- [ ] Imágenes tienen marca de agua
- [ ] Admin panel muestra negocios pendientes
- [ ] Aprobar/Rechazar actualiza el estado
- [ ] Notificaciones se crean correctamente
- [ ] Negocio aprobado aparece en `/negocios`

---

**¡Si todo pasa, estás listo para producción!** 🚀
