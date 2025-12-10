-- ============================================
-- POLÍTICAS RLS COMPLETAS PARA XOLONICA
-- ============================================

-- ============================================
-- 1. TABLA BUSINESSES
-- ============================================

-- Eliminar políticas existentes
DROP POLICY IF EXISTS "Todos pueden ver negocios verificados" ON businesses;
DROP POLICY IF EXISTS "Usuarios pueden crear negocios" ON businesses;
DROP POLICY IF EXISTS "Usuarios pueden actualizar sus negocios" ON businesses;
DROP POLICY IF EXISTS "Admins pueden actualizar cualquier negocio" ON businesses;
DROP POLICY IF EXISTS "Admins pueden ver todos los negocios" ON businesses;

-- Habilitar RLS
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;

-- Política: Todos pueden ver negocios verificados
CREATE POLICY "Todos pueden ver negocios verificados"
  ON businesses
  FOR SELECT
  USING (status = 'verified' OR auth.uid() = owner_id);

-- Política: Usuarios autenticados pueden crear negocios
CREATE POLICY "Usuarios pueden crear negocios"
  ON businesses
  FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

-- Política: Usuarios pueden actualizar sus propios negocios
CREATE POLICY "Usuarios pueden actualizar sus negocios"
  ON businesses
  FOR UPDATE
  USING (auth.uid() = owner_id);

-- Política: Admins pueden ver todos los negocios
CREATE POLICY "Admins pueden ver todos los negocios"
  ON businesses
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.user_id = auth.uid()
    )
  );

-- Política: Admins pueden actualizar cualquier negocio
CREATE POLICY "Admins pueden actualizar cualquier negocio"
  ON businesses
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.user_id = auth.uid()
    )
  );

-- ============================================
-- 2. TABLA PRODUCTS
-- ============================================

DROP POLICY IF EXISTS "Todos pueden ver productos" ON products;
DROP POLICY IF EXISTS "Dueños pueden insertar productos" ON products;
DROP POLICY IF EXISTS "Dueños pueden actualizar productos" ON products;

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Política: Todos pueden ver productos de negocios verificados
CREATE POLICY "Todos pueden ver productos"
  ON products
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM businesses
      WHERE businesses.id = products.business_id
      AND businesses.status = 'verified'
    )
  );

-- Política: Dueños pueden insertar productos en sus negocios
CREATE POLICY "Dueños pueden insertar productos"
  ON products
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM businesses
      WHERE businesses.id = products.business_id
      AND businesses.owner_id = auth.uid()
    )
  );

-- Política: Dueños pueden actualizar productos de sus negocios
CREATE POLICY "Dueños pueden actualizar productos"
  ON products
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM businesses
      WHERE businesses.id = products.business_id
      AND businesses.owner_id = auth.uid()
    )
  );

-- ============================================
-- 3. TABLA NOTIFICATIONS
-- ============================================

DROP POLICY IF EXISTS "Usuarios pueden ver sus notificaciones" ON notifications;
DROP POLICY IF EXISTS "Usuarios pueden actualizar sus notificaciones" ON notifications;
DROP POLICY IF EXISTS "Sistema puede crear notificaciones" ON notifications;

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Política: Usuarios pueden ver sus propias notificaciones
CREATE POLICY "Usuarios pueden ver sus notificaciones"
  ON notifications
  FOR SELECT
  USING (auth.uid() = user_id);

-- Política: Usuarios pueden actualizar sus propias notificaciones
CREATE POLICY "Usuarios pueden actualizar sus notificaciones"
  ON notifications
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Política: Sistema puede crear notificaciones (para triggers y admins)
CREATE POLICY "Sistema puede crear notificaciones"
  ON notifications
  FOR INSERT
  WITH CHECK (true);

-- ============================================
-- 4. TABLA ADMINS
-- ============================================

DROP POLICY IF EXISTS "Admins pueden ver admins" ON admins;
DROP POLICY IF EXISTS "Usuarios autenticados pueden verificar admin" ON admins;

ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- Política: Cualquier usuario autenticado puede verificar si es admin
-- (Necesario para que el AdminDashboard funcione)
CREATE POLICY "Usuarios autenticados pueden verificar admin"
  ON admins
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- ============================================
-- 5. VERIFICAR POLÍTICAS
-- ============================================

-- Ver todas las políticas de businesses
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'businesses';

-- Ver todas las políticas de products
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'products';

-- Ver todas las políticas de notifications
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'notifications';

-- ============================================
-- 6. TESTING
-- ============================================

-- Verificar que un admin puede actualizar negocios
-- (Ejecuta esto después de crear el admin)
/*
UPDATE businesses
SET status = 'verified'
WHERE id = 'ID_DEL_NEGOCIO';
*/

-- Verificar que se puede crear una notificación
/*
INSERT INTO notifications (user_id, title, message, type, read)
VALUES (
  'USER_ID_DEL_DUEÑO',
  'Test',
  'Mensaje de prueba',
  'test',
  false
);
*/
