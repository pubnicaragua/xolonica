-- ============================================
-- SQL PARA AGREGAR ADMIN EN SUPABASE
-- ============================================

-- 1. Primero, agrega la columna has_online_store si no existe
ALTER TABLE businesses
ADD COLUMN IF NOT EXISTS has_online_store BOOLEAN DEFAULT false;

-- 2. Agrega el usuario admin en Supabase Auth (esto lo haces desde el dashboard de Supabase)
-- Email: adminileana@gmail.com
-- Contraseña: @Managua2024%$
-- Luego copia el user_id que se genera

-- 3. Una vez tengas el user_id, ejecuta este comando (reemplaza USER_ID_AQUI):
INSERT INTO admins (user_id, email)
VALUES ('USER_ID_AQUI', 'adminileana@gmail.com')
ON CONFLICT (user_id) DO NOTHING;

-- ============================================
-- PASOS EN SUPABASE DASHBOARD:
-- ============================================
-- 1. Ve a Authentication > Users
-- 2. Click en "Add user"
-- 3. Email: adminileana@gmail.com
-- 4. Password: @Managua2024%$
-- 5. Click "Create user"
-- 6. Copia el User ID (UUID)
-- 7. Ejecuta el INSERT arriba reemplazando USER_ID_AQUI con el UUID copiado

-- ============================================
-- VERIFICAR QUE FUNCIONÓ:
-- ============================================
SELECT * FROM admins WHERE email = 'adminileana@gmail.com';

-- Debería mostrar una fila con:
-- user_id: [UUID del usuario]
-- email: adminileana@gmail.com
-- created_at: [fecha actual]
