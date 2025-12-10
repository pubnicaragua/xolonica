-- ============================================
-- ARREGLAR OWNER_ID EN NEGOCIOS EXISTENTES
-- ============================================

-- PROBLEMA: Negocios registrados antes de implementar owner_id
-- SOLUCIÓN: Asignarles un owner_id válido

-- ============================================
-- OPCIÓN 1: Asignar al admin (RECOMENDADO)
-- ============================================

-- Ver negocios sin owner_id
SELECT id, name, email, phone, created_at 
FROM businesses 
WHERE owner_id IS NULL;

-- Asignar todos los negocios sin owner al admin
UPDATE businesses
SET owner_id = (
  SELECT user_id 
  FROM admins 
  WHERE email = 'adminileana@gmail.com'
  LIMIT 1
)
WHERE owner_id IS NULL;

-- ============================================
-- OPCIÓN 2: Crear usuarios para cada negocio
-- ============================================

-- Si quieres crear un usuario para cada negocio basado en su email:

/*
-- PASO 1: Primero necesitas crear usuarios en Supabase Auth manualmente
-- Ve a Authentication > Users y crea usuarios con los emails de los negocios

-- PASO 2: Luego ejecuta esto para cada negocio:
UPDATE businesses
SET owner_id = (
  SELECT id 
  FROM auth.users 
  WHERE email = 'EMAIL_DEL_NEGOCIO'
)
WHERE email = 'EMAIL_DEL_NEGOCIO' AND owner_id IS NULL;
*/

-- ============================================
-- OPCIÓN 3: Asignar al primer usuario disponible
-- ============================================

/*
UPDATE businesses
SET owner_id = (SELECT id FROM auth.users LIMIT 1)
WHERE owner_id IS NULL;
*/

-- ============================================
-- VERIFICAR QUE FUNCIONÓ
-- ============================================

-- Ver todos los negocios con su owner_id
SELECT 
  id, 
  name, 
  email,
  owner_id,
  status,
  created_at
FROM businesses 
ORDER BY created_at DESC;

-- Contar negocios sin owner_id (debería ser 0)
SELECT COUNT(*) as negocios_sin_owner
FROM businesses 
WHERE owner_id IS NULL;

-- Ver qué usuario es el owner
SELECT 
  b.id,
  b.name as negocio,
  b.owner_id,
  u.email as owner_email
FROM businesses b
LEFT JOIN auth.users u ON b.owner_id = u.id
ORDER BY b.created_at DESC;

-- ============================================
-- DESPUÉS DE ARREGLAR
-- ============================================

-- Ahora prueba aprobar un negocio desde el admin panel
-- Deberías ver en la consola:
-- ✅ Negocio actualizado: [...]
-- 👤 Negocio encontrado: {...}
-- 📧 Creando notificación para owner_id: [UUID]
-- ✅ Notificación creada: [...]
