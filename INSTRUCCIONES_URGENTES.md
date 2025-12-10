# 🚨 INSTRUCCIONES URGENTES - ARREGLAR APROBAR/RECHAZAR

## ❗ PROBLEMA ACTUAL
Los botones de "Aprobar" y "Rechazar" en el admin panel no están funcionando.

## ✅ SOLUCIÓN (EJECUTA ESTO EN SUPABASE)

### **PASO 1: Ejecutar Políticas RLS**

Ve a **Supabase > SQL Editor** y ejecuta el archivo completo:
```
SQL_POLICIES_COMPLETO.sql
```

Este archivo contiene TODAS las políticas necesarias para que funcione correctamente.

---

### **PASO 2: Verificar que la tabla `notifications` existe**

Ejecuta esto en Supabase SQL Editor:

```sql
-- Verificar si existe
SELECT * FROM notifications LIMIT 1;
```

Si da error, ejecuta:
```
SQL_NOTIFICACIONES.sql
```

---

### **PASO 3: Verificar que `owner_id` existe en businesses**

```sql
-- Verificar columna
SELECT id, name, status, owner_id 
FROM businesses 
LIMIT 5;
```

Si `owner_id` no existe, ejecuta:
```sql
ALTER TABLE businesses
ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
```

---

### **PASO 4: Actualizar negocios existentes con owner_id**

Si ya tienes negocios registrados SIN `owner_id`, necesitas asignarles uno:

```sql
-- Opción A: Asignar al admin actual
UPDATE businesses
SET owner_id = (SELECT id FROM auth.users WHERE email = 'adminileana@gmail.com')
WHERE owner_id IS NULL;

-- Opción B: Asignar al primer usuario que encuentres
UPDATE businesses
SET owner_id = (SELECT id FROM auth.users LIMIT 1)
WHERE owner_id IS NULL;
```

---

## 🧪 PROBAR QUE FUNCIONA

### **1. Abre la consola del navegador** (F12)

### **2. Ve a `/admin` y haz login**

### **3. Click en "Aprobar" un negocio**

Deberías ver en la consola:
```
🟢 Iniciando aprobación de negocio: [ID]
📝 Actualizando estado a verified...
✅ Negocio actualizado: [...]
👤 Negocio encontrado: {...}
📧 Creando notificación para owner_id: [ID]
✅ Notificación creada: [...]
🔄 Recargando datos...
🎉 Proceso completado
```

### **4. Si ves errores:**

#### **Error: "new row violates row-level security policy"**
✅ **Solución**: Ejecuta `SQL_POLICIES_COMPLETO.sql`

#### **Error: "column owner_id does not exist"**
✅ **Solución**: Ejecuta el ALTER TABLE del PASO 3

#### **Error: "relation notifications does not exist"**
✅ **Solución**: Ejecuta `SQL_NOTIFICACIONES.sql`

#### **Warning: "No se encontró owner_id para el negocio"**
✅ **Solución**: Ejecuta el UPDATE del PASO 4

---

## 📋 CHECKLIST COMPLETO

- [ ] ✅ Ejecutado `SQL_POLICIES_COMPLETO.sql`
- [ ] ✅ Ejecutado `SQL_NOTIFICACIONES.sql`
- [ ] ✅ Verificado que `owner_id` existe en `businesses`
- [ ] ✅ Actualizado negocios existentes con `owner_id`
- [ ] ✅ Creado usuario admin en Supabase Auth
- [ ] ✅ Insertado admin en tabla `admins`
- [ ] ✅ Probado aprobar un negocio
- [ ] ✅ Verificado logs en consola
- [ ] ✅ Verificado que el negocio cambió a "verified"
- [ ] ✅ Verificado que se creó la notificación

---

## 🔍 VERIFICAR EN SUPABASE

### **Ver negocios:**
```sql
SELECT id, name, status, owner_id, created_at 
FROM businesses 
ORDER BY created_at DESC;
```

### **Ver notificaciones:**
```sql
SELECT * FROM notifications 
ORDER BY created_at DESC 
LIMIT 10;
```

### **Ver políticas activas:**
```sql
SELECT tablename, policyname, cmd 
FROM pg_policies 
WHERE tablename IN ('businesses', 'notifications', 'products');
```

---

## 🚀 DESPUÉS DE ARREGLAR

1. **Haz commit y push** de los cambios
2. **Redeploy en Vercel** (automático si está conectado a GitHub)
3. **Prueba en producción**

---

**¡Con esto debería funcionar perfectamente!** 🎉
