# 🚨 HACER AHORA - PASO A PASO

## ✅ PASO 1: ARREGLAR TABLA ADMINS (URGENTE)

Ve a **Supabase > SQL Editor** y ejecuta:

```sql
-- Eliminar tabla admins problemática
DROP TABLE IF EXISTS admins CASCADE;

-- Crear tabla admins correctamente
CREATE TABLE admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id),
  UNIQUE(email)
);

-- Crear índices
CREATE INDEX idx_admins_user_id ON admins(user_id);
CREATE INDEX idx_admins_email ON admins(email);

-- Habilitar RLS
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- Crear política (IMPORTANTE: permite que usuarios autenticados verifiquen si son admin)
CREATE POLICY "Usuarios autenticados pueden verificar admin"
  ON admins
  FOR SELECT
  USING (auth.uid() IS NOT NULL);
```

---

## ✅ PASO 2: CREAR USUARIO ADMIN

### **A. En Supabase Dashboard:**
1. Ve a **Authentication > Users**
2. Click **"Add user"**
3. **Email**: `adminileana@gmail.com`
4. **Password**: `@Managua2024%$`
5. Click **"Create user"**
6. **COPIA EL USER ID** (algo como: `24607dd6-ce9a-4481-beec-cc4dd6a1f424`)

### **B. Ejecuta en SQL Editor:**
```sql
-- Reemplaza TU_USER_ID con el ID que copiaste
INSERT INTO admins (user_id, email)
VALUES ('TU_USER_ID_AQUI', 'adminileana@gmail.com')
ON CONFLICT (user_id) DO NOTHING;
```

### **C. Verifica que funcionó:**
```sql
SELECT * FROM admins;
```

Deberías ver una fila con tu admin.

---

## ✅ PASO 3: EJECUTAR POLÍTICAS COMPLETAS

Ejecuta en **SQL Editor**:

```sql
-- POLÍTICAS PARA BUSINESSES
DROP POLICY IF EXISTS "Todos pueden ver negocios verificados" ON businesses;
DROP POLICY IF EXISTS "Usuarios pueden crear negocios" ON businesses;
DROP POLICY IF EXISTS "Usuarios pueden actualizar sus negocios" ON businesses;
DROP POLICY IF EXISTS "Admins pueden actualizar cualquier negocio" ON businesses;
DROP POLICY IF EXISTS "Admins pueden ver todos los negocios" ON businesses;

ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Todos pueden ver negocios verificados"
  ON businesses FOR SELECT
  USING (status = 'verified' OR auth.uid() = owner_id);

CREATE POLICY "Usuarios pueden crear negocios"
  ON businesses FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Usuarios pueden actualizar sus negocios"
  ON businesses FOR UPDATE
  USING (auth.uid() = owner_id);

CREATE POLICY "Admins pueden ver todos los negocios"
  ON businesses FOR SELECT
  USING (EXISTS (SELECT 1 FROM admins WHERE admins.user_id = auth.uid()));

CREATE POLICY "Admins pueden actualizar cualquier negocio"
  ON businesses FOR UPDATE
  USING (EXISTS (SELECT 1 FROM admins WHERE admins.user_id = auth.uid()));
```

---

## ✅ PASO 4: ARREGLAR NEGOCIOS SIN OWNER_ID (IMPORTANTE)

### **Ver negocios sin owner_id:**
```sql
SELECT id, name, email, owner_id, created_at 
FROM businesses 
WHERE owner_id IS NULL;
```

### **Si hay negocios sin owner_id, ejecuta:**
```sql
-- Asignar todos los negocios sin owner al admin
UPDATE businesses
SET owner_id = (
  SELECT user_id 
  FROM admins 
  WHERE email = 'adminileana@gmail.com'
  LIMIT 1
)
WHERE owner_id IS NULL;
```

### **Verificar que funcionó:**
```sql
-- Debería devolver 0
SELECT COUNT(*) as negocios_sin_owner
FROM businesses 
WHERE owner_id IS NULL;
```

---

## ✅ PASO 5: CREAR TABLA NOTIFICATIONS

```sql
-- Crear tabla
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(50) NOT NULL,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);

-- RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuarios pueden ver sus notificaciones"
  ON notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Sistema puede crear notificaciones"
  ON notifications FOR INSERT
  WITH CHECK (true);
```

---

## 🧪 PASO 6: PROBAR

1. **Recarga la página** del admin panel
2. **Abre la consola** (F12)
3. **Click en "Aprobar"** un negocio
4. **Mira la consola** - deberías ver:
   ```
   🟢 Iniciando aprobación de negocio: ...
   📝 Actualizando estado a verified...
   ✅ Negocio actualizado: ...
   ```

---

## ❌ SI AÚN DA ERROR

### **Error 500 en /admins:**
```sql
-- Verifica que la política existe
SELECT * FROM pg_policies WHERE tablename = 'admins';
```

Debería mostrar: `"Usuarios autenticados pueden verificar admin"`

### **Error: "owner_id does not exist":**
```sql
ALTER TABLE businesses
ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES auth.users(id);
```

### **Error: "notifications does not exist":**
Ejecuta el PASO 5 de nuevo.

---

## 📋 CHECKLIST FINAL

- [ ] ✅ Tabla `admins` recreada
- [ ] ✅ Usuario admin creado en Auth
- [ ] ✅ Admin insertado en tabla `admins`
- [ ] ✅ Políticas de `businesses` ejecutadas
- [ ] ✅ Columna `owner_id` existe en `businesses`
- [ ] ✅ Negocios tienen `owner_id` asignado
- [ ] ✅ Tabla `notifications` creada
- [ ] ✅ Probado aprobar/rechazar
- [ ] ✅ Verificado logs en consola

---

**¡Después de esto debería funcionar perfectamente!** 🚀
