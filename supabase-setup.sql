-- ============================================================================
-- XOLONICA.STORE - CONFIGURACIÓN COMPLETA DE SUPABASE
-- ============================================================================
-- Este archivo contiene todas las configuraciones necesarias para que
-- Xolonica funcione correctamente con todas las nuevas funcionalidades.
-- 
-- INSTRUCCIONES:
-- 1. Ejecuta este SQL en el editor SQL de Supabase (Settings > SQL Editor)
-- 2. Verifica que los buckets de Storage existan y tengan las políticas correctas
-- 3. Habilita Realtime en las tablas necesarias desde el Dashboard
-- ============================================================================

-- ============================================================================
-- 1. POLÍTICAS RLS (Row Level Security) PARA REVIEWS
-- ============================================================================
-- Permitir que cualquier usuario autenticado pueda insertar reseñas

-- Eliminar políticas existentes si las hay
DROP POLICY IF EXISTS "Users can insert their own reviews" ON reviews;
DROP POLICY IF EXISTS "Anyone can view reviews" ON reviews;

-- Política para insertar reseñas (usuarios autenticados)
CREATE POLICY "Users can insert their own reviews"
ON reviews
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Política para ver reseñas (público)
CREATE POLICY "Anyone can view reviews"
ON reviews
FOR SELECT
TO public
USING (true);

-- ============================================================================
-- 2. POLÍTICAS RLS PARA BUSINESS_MESSAGES (CHAT EN TIEMPO REAL)
-- ============================================================================
-- Permitir que usuarios autenticados puedan enviar y ver mensajes

DROP POLICY IF EXISTS "Users can send messages" ON business_messages;
DROP POLICY IF EXISTS "Users can view messages" ON business_messages;
DROP POLICY IF EXISTS "Business owners can view their messages" ON business_messages;

-- Política para enviar mensajes
CREATE POLICY "Users can send messages"
ON business_messages
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = sender_id OR sender_id IS NULL);

-- Política para ver mensajes (usuarios pueden ver mensajes de negocios que están viendo)
CREATE POLICY "Users can view messages"
ON business_messages
FOR SELECT
TO authenticated
USING (true);

-- Actualizar mensajes como leídos
CREATE POLICY "Users can update message read status"
ON business_messages
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- ============================================================================
-- 3. HABILITAR REALTIME EN TABLAS NECESARIAS
-- ============================================================================
-- Nota: Esto también se puede hacer desde el Dashboard de Supabase
-- Database > Replication > Enable realtime for tables

-- Habilitar realtime para business_messages
ALTER PUBLICATION supabase_realtime ADD TABLE business_messages;

-- Habilitar realtime para reviews (opcional, para ver reseñas en tiempo real)
ALTER PUBLICATION supabase_realtime ADD TABLE reviews;

-- ============================================================================
-- 4. ÍNDICES PARA MEJORAR PERFORMANCE
-- ============================================================================

-- Índice para búsqueda rápida de mensajes por negocio
CREATE INDEX IF NOT EXISTS idx_business_messages_business_id 
ON business_messages(business_id);

-- Índice para búsqueda rápida de mensajes por fecha
CREATE INDEX IF NOT EXISTS idx_business_messages_created_at 
ON business_messages(created_at DESC);

-- Índice para búsqueda rápida de reseñas por negocio
CREATE INDEX IF NOT EXISTS idx_reviews_business_id 
ON reviews(business_id);

-- Índice para búsqueda rápida de productos por negocio
CREATE INDEX IF NOT EXISTS idx_products_business_id 
ON products(business_id);

-- ============================================================================
-- 5. VISTA PARA PRODUCTOS CON INFORMACIÓN DEL NEGOCIO
-- ============================================================================
-- Esta vista facilita la búsqueda de productos mostrando info del negocio

DROP VIEW IF EXISTS products_with_business;

CREATE VIEW products_with_business AS
SELECT 
  p.id,
  p.business_id,
  p.name,
  p.description,
  p.price,
  p.image_url,
  p.available,
  p.notes,
  p.created_at,
  b.name as business_name,
  b.city as business_city,
  b.logo_url as business_logo,
  b.verification_level,
  b.status as business_status
FROM products p
INNER JOIN businesses b ON p.business_id = b.id
WHERE b.status = 'verified';

-- ============================================================================
-- 6. FUNCIÓN PARA BÚSQUEDA DE PRODUCTOS (FULL TEXT SEARCH)
-- ============================================================================
-- Mejora la búsqueda de productos con búsqueda de texto completo

DROP FUNCTION IF EXISTS search_products(text, integer);

CREATE OR REPLACE FUNCTION search_products(
  search_query TEXT,
  limit_count INT DEFAULT 20
)
RETURNS TABLE (
  id UUID,
  name TEXT,
  description TEXT,
  price NUMERIC,
  image_url TEXT,
  business_id UUID,
  business_name TEXT,
  business_city TEXT,
  business_logo TEXT,
  verification_level INT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.name,
    p.description,
    p.price,
    p.image_url,
    p.business_id,
    b.name as business_name,
    b.city as business_city,
    b.logo_url as business_logo,
    b.verification_level
  FROM products p
  INNER JOIN businesses b ON p.business_id = b.id
  WHERE 
    b.status = 'verified'
    AND p.available = true
    AND (
      p.name ILIKE '%' || search_query || '%'
      OR p.description ILIKE '%' || search_query || '%'
      OR b.name ILIKE '%' || search_query || '%'
    )
  ORDER BY 
    CASE 
      WHEN p.name ILIKE search_query || '%' THEN 1
      WHEN p.name ILIKE '%' || search_query || '%' THEN 2
      ELSE 3
    END,
    p.created_at DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 7. VISTA PARA ESTADÍSTICAS DEL ADMIN
-- ============================================================================

CREATE OR REPLACE VIEW admin_stats AS
SELECT
  (SELECT COUNT(*) FROM businesses WHERE status = 'verified') as verified_businesses,
  (SELECT COUNT(*) FROM businesses WHERE status = 'pending') as pending_businesses,
  (SELECT COUNT(*) FROM products) as total_products,
  (SELECT COUNT(*) FROM reviews) as total_reviews,
  (SELECT COUNT(DISTINCT user_id) FROM reviews) as active_users;

-- ============================================================================
-- 8. TRIGGER PARA ACTUALIZAR PRODUCT_COUNT EN BUSINESSES
-- ============================================================================
-- Mantiene actualizado el contador de productos de cada negocio

CREATE OR REPLACE FUNCTION update_business_product_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE businesses 
    SET product_count = (
      SELECT COUNT(*) FROM products WHERE business_id = NEW.business_id
    )
    WHERE id = NEW.business_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE businesses 
    SET product_count = (
      SELECT COUNT(*) FROM products WHERE business_id = OLD.business_id
    )
    WHERE id = OLD.business_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Crear trigger
DROP TRIGGER IF EXISTS trigger_update_product_count ON products;
CREATE TRIGGER trigger_update_product_count
AFTER INSERT OR DELETE ON products
FOR EACH ROW
EXECUTE FUNCTION update_business_product_count();

-- ============================================================================
-- 9. POLÍTICAS DE STORAGE PARA BUCKETS
-- ============================================================================
-- IMPORTANTE: Estas políticas deben aplicarse desde el Dashboard de Supabase
-- Storage > Policies, o usando el siguiente código adaptado:

-- Para el bucket 'business-logos':
-- 1. Ir a Storage > business-logos > Policies
-- 2. Crear política "Public Access" para SELECT (lectura pública)
-- 3. Crear política "Authenticated users can upload" para INSERT (usuarios autenticados)

-- Para el bucket 'product-images':
-- 1. Ir a Storage > product-images > Policies  
-- 2. Crear política "Public Access" para SELECT (lectura pública)
-- 3. Crear política "Authenticated users can upload" para INSERT (usuarios autenticados)

-- Ejemplo de política para SELECT (lectura pública):
-- CREATE POLICY "Public Access"
-- ON storage.objects FOR SELECT
-- USING ( bucket_id = 'business-logos' );

-- Ejemplo de política para INSERT (usuarios autenticados):
-- CREATE POLICY "Authenticated users can upload"
-- ON storage.objects FOR INSERT
-- TO authenticated
-- WITH CHECK ( bucket_id = 'business-logos' );

-- ============================================================================
-- 10. VERIFICAR QUE LOS BUCKETS EXISTAN
-- ============================================================================
-- Ejecuta esto para verificar que los buckets existan:
-- SELECT * FROM storage.buckets WHERE name IN ('business-logos', 'product-images');

-- Si no existen, créalos desde el Dashboard:
-- Storage > Create bucket
-- Nombre: business-logos (público)
-- Nombre: product-images (público)

-- ============================================================================
-- 11. POLÍTICAS ADICIONALES PARA BUSINESSES
-- ============================================================================

-- Permitir que usuarios autenticados creen negocios
DROP POLICY IF EXISTS "Users can create businesses" ON businesses;
CREATE POLICY "Users can create businesses"
ON businesses
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = owner_id);

-- Permitir que todos vean negocios verificados
DROP POLICY IF EXISTS "Anyone can view verified businesses" ON businesses;
CREATE POLICY "Anyone can view verified businesses"
ON businesses
FOR SELECT
TO public
USING (status = 'verified' OR status = 'pending');

-- Permitir que los dueños actualicen sus negocios
DROP POLICY IF EXISTS "Owners can update their businesses" ON businesses;
CREATE POLICY "Owners can update their businesses"
ON businesses
FOR UPDATE
TO authenticated
USING (auth.uid() = owner_id)
WITH CHECK (auth.uid() = owner_id);

-- ============================================================================
-- 12. POLÍTICAS PARA PRODUCTS
-- ============================================================================

-- Permitir que dueños de negocios creen productos
DROP POLICY IF EXISTS "Business owners can create products" ON products;
CREATE POLICY "Business owners can create products"
ON products
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM businesses 
    WHERE id = business_id AND owner_id = auth.uid()
  )
);

-- Permitir que todos vean productos de negocios verificados
DROP POLICY IF EXISTS "Anyone can view products" ON products;
CREATE POLICY "Anyone can view products"
ON products
FOR SELECT
TO public
USING (
  EXISTS (
    SELECT 1 FROM businesses 
    WHERE id = business_id AND status = 'verified'
  )
);

-- Permitir que dueños actualicen sus productos
DROP POLICY IF EXISTS "Business owners can update their products" ON products;
CREATE POLICY "Business owners can update their products"
ON products
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM businesses 
    WHERE id = business_id AND owner_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM businesses 
    WHERE id = business_id AND owner_id = auth.uid()
  )
);

-- ============================================================================
-- 13. FUNCIÓN PARA LIMPIAR MENSAJES ANTIGUOS (OPCIONAL)
-- ============================================================================
-- Ejecutar periódicamente para mantener la base de datos limpia

CREATE OR REPLACE FUNCTION cleanup_old_messages()
RETURNS void AS $$
BEGIN
  DELETE FROM business_messages 
  WHERE created_at < NOW() - INTERVAL '90 days';
END;
$$ LANGUAGE plpgsql;

-- Para ejecutar manualmente:
-- SELECT cleanup_old_messages();

-- ============================================================================
-- FIN DE LA CONFIGURACIÓN
-- ============================================================================
-- 
-- PASOS FINALES:
-- 
-- 1. Verifica que los buckets de Storage existan:
--    - business-logos (público)
--    - product-images (público)
--
-- 2. Configura las políticas de Storage desde el Dashboard
--
-- 3. Habilita Realtime para las tablas:
--    - business_messages
--    - reviews (opcional)
--
-- 4. Prueba la aplicación:
--    - Registro de usuario
--    - Registro de negocio con imágenes
--    - Búsqueda de productos
--    - Chat en tiempo real
--    - Reseñas
--
-- ============================================================================
