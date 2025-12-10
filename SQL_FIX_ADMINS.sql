-- ============================================
-- ARREGLAR TABLA ADMINS
-- ============================================

-- PASO 1: Eliminar tabla si existe (con cuidado)
DROP TABLE IF EXISTS admins CASCADE;

-- PASO 2: Crear tabla admins correctamente
CREATE TABLE admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id),
  UNIQUE(email)
);

-- PASO 3: Crear índice
CREATE INDEX IF NOT EXISTS idx_admins_user_id ON admins(user_id);
CREATE INDEX IF NOT EXISTS idx_admins_email ON admins(email);

-- PASO 4: Habilitar RLS
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- PASO 5: Eliminar políticas antiguas
DROP POLICY IF EXISTS "Admins pueden ver admins" ON admins;
DROP POLICY IF EXISTS "Public can read admins" ON admins;
DROP POLICY IF EXISTS "Admins can insert" ON admins;
DROP POLICY IF EXISTS "Admins can update" ON admins;

-- PASO 6: Crear políticas correctas
-- Política: Cualquier usuario autenticado puede verificar si es admin
CREATE POLICY "Usuarios autenticados pueden verificar admin"
  ON admins
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Política: Solo admins pueden insertar nuevos admins
CREATE POLICY "Solo admins pueden insertar admins"
  ON admins
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.user_id = auth.uid()
    )
  );

-- PASO 7: Insertar admin inicial
-- IMPORTANTE: Primero crea el usuario en Supabase Auth
-- Email: adminileana@gmail.com
-- Password: @Managua2024%$
-- Luego copia el USER_ID y ejecútalo aquí:

/*
INSERT INTO admins (user_id, email)
VALUES ('TU_USER_ID_AQUI', 'adminileana@gmail.com')
ON CONFLICT (user_id) DO NOTHING;
*/

-- PASO 8: Verificar que funcionó
SELECT * FROM admins;

-- ============================================
-- TROUBLESHOOTING
-- ============================================

-- Si aún da error 500, verifica:

-- 1. Ver errores en logs de Supabase
-- Dashboard > Logs > Postgres Logs

-- 2. Verificar que la tabla existe
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'admins';

-- 3. Verificar políticas
SELECT schemaname, tablename, policyname, permissive, roles, cmd
FROM pg_policies
WHERE tablename = 'admins';

-- 4. Verificar que el usuario existe en auth.users
SELECT id, email, created_at 
FROM auth.users 
WHERE email = 'adminileana@gmail.com';
