-- =====================================================
-- XOLONICA.STORE - MIGRACIONES COMPLETAS DE SUPABASE
-- =====================================================

-- 1. Actualizar tabla businesses para sistema de estrellas
ALTER TABLE businesses 
ADD COLUMN IF NOT EXISTS verification_level INTEGER DEFAULT 1 CHECK (verification_level BETWEEN 1 AND 3),
ADD COLUMN IF NOT EXISTS cedula_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS cedula_photo_url TEXT,
ADD COLUMN IF NOT EXISTS has_physical_store BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS ruc TEXT,
ADD COLUMN IF NOT EXISTS bank_account_name TEXT,
ADD COLUMN IF NOT EXISTS product_count INTEGER DEFAULT 0;

-- Comentarios para entender el sistema de estrellas
COMMENT ON COLUMN businesses.verification_level IS '1=Nombre básico, 2=Cédula verificada, 3=Tienda física+RUC';

-- 2. Crear tabla para mensajes de chat entre clientes y negocios
CREATE TABLE IF NOT EXISTS business_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  sender_type TEXT NOT NULL CHECK (sender_type IN ('customer', 'business')),
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_business_messages_business ON business_messages(business_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_business_messages_sender ON business_messages(sender_id);

-- 3. Crear tabla para mensajes del chatbot general
CREATE TABLE IF NOT EXISTS chatbot_conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id TEXT NOT NULL,
  message TEXT NOT NULL,
  sender TEXT NOT NULL CHECK (sender IN ('user', 'bot')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_chatbot_session ON chatbot_conversations(session_id, created_at);

-- 4. Actualizar tabla products para búsqueda global
ALTER TABLE products
ADD COLUMN IF NOT EXISTS search_vector tsvector;

-- Crear índice de búsqueda full-text en productos
CREATE INDEX IF NOT EXISTS idx_products_search ON products USING gin(search_vector);

-- Función para actualizar el vector de búsqueda automáticamente
CREATE OR REPLACE FUNCTION products_search_trigger() RETURNS trigger AS $$
BEGIN
  NEW.search_vector := 
    setweight(to_tsvector('spanish', COALESCE(NEW.name, '')), 'A') ||
    setweight(to_tsvector('spanish', COALESCE(NEW.description, '')), 'B');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar búsqueda al insertar/actualizar
DROP TRIGGER IF EXISTS products_search_update ON products;
CREATE TRIGGER products_search_update
  BEFORE INSERT OR UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION products_search_trigger();

-- Actualizar vectores existentes
UPDATE products SET search_vector = 
  setweight(to_tsvector('spanish', COALESCE(name, '')), 'A') ||
  setweight(to_tsvector('spanish', COALESCE(description, '')), 'B');

-- 5. Crear tabla para administradores
CREATE TABLE IF NOT EXISTS admins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  email TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Crear función para contar productos por negocio
CREATE OR REPLACE FUNCTION update_business_product_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE businesses
  SET product_count = (
    SELECT COUNT(*) FROM products WHERE business_id = COALESCE(NEW.business_id, OLD.business_id)
  )
  WHERE id = COALESCE(NEW.business_id, OLD.business_id);
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar contador de productos
DROP TRIGGER IF EXISTS update_product_count_trigger ON products;
CREATE TRIGGER update_product_count_trigger
  AFTER INSERT OR UPDATE OR DELETE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_business_product_count();

-- Actualizar contadores existentes
UPDATE businesses b
SET product_count = (SELECT COUNT(*) FROM products p WHERE p.business_id = b.id);

-- =====================================================
-- POLÍTICAS DE SEGURIDAD (RLS)
-- =====================================================

-- Habilitar RLS en nuevas tablas
ALTER TABLE business_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE chatbot_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- Políticas para business_messages
CREATE POLICY "Usuarios pueden ver mensajes de sus conversaciones"
  ON business_messages FOR SELECT
  USING (
    auth.uid() = sender_id OR
    business_id IN (SELECT id FROM businesses WHERE owner_id = auth.uid())
  );

CREATE POLICY "Usuarios pueden enviar mensajes"
  ON business_messages FOR INSERT
  WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Dueños de negocio pueden enviar mensajes"
  ON business_messages FOR INSERT
  WITH CHECK (
    business_id IN (SELECT id FROM businesses WHERE owner_id = auth.uid())
  );

-- Políticas para chatbot_conversations
CREATE POLICY "Usuarios pueden ver sus conversaciones"
  ON chatbot_conversations FOR SELECT
  USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Cualquiera puede crear conversaciones"
  ON chatbot_conversations FOR INSERT
  WITH CHECK (true);

-- Políticas para admins
CREATE POLICY "Solo admins pueden ver admins"
  ON admins FOR SELECT
  USING (user_id = auth.uid());

-- =====================================================
-- VISTAS ÚTILES
-- =====================================================

-- Vista para búsqueda de productos con información del negocio
CREATE OR REPLACE VIEW products_with_business AS
SELECT 
  p.*,
  b.name as business_name,
  b.city as business_city,
  b.logo_url as business_logo,
  b.verification_level,
  b.status as business_status
FROM products p
JOIN businesses b ON p.business_id = b.id
WHERE b.status = 'verified';

-- Vista para estadísticas de admin
CREATE OR REPLACE VIEW admin_stats AS
SELECT
  (SELECT COUNT(*) FROM businesses WHERE status = 'verified') as verified_businesses,
  (SELECT COUNT(*) FROM businesses WHERE status = 'pending') as pending_businesses,
  (SELECT COUNT(*) FROM products) as total_products,
  (SELECT COUNT(*) FROM reviews) as total_reviews,
  (SELECT COUNT(DISTINCT user_id) FROM reviews) as active_users;

-- =====================================================
-- FUNCIONES ÚTILES
-- =====================================================

-- Función para buscar productos globalmente
CREATE OR REPLACE FUNCTION search_products(search_query TEXT, limit_count INTEGER DEFAULT 20)
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
  verification_level INTEGER,
  rank REAL
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
    b.verification_level,
    ts_rank(p.search_vector, plainto_tsquery('spanish', search_query)) as rank
  FROM products p
  JOIN businesses b ON p.business_id = b.id
  WHERE 
    b.status = 'verified' AND
    p.search_vector @@ plainto_tsquery('spanish', search_query)
  ORDER BY rank DESC, p.created_at DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- DATOS INICIALES
-- =====================================================

-- Insertar primer admin (ajusta el email según tu usuario)
-- Ejecuta esto después de crear tu cuenta en la app
-- INSERT INTO admins (user_id, email)
-- SELECT id, email FROM auth.users WHERE email = 'tu-email@ejemplo.com'
-- ON CONFLICT (user_id) DO NOTHING;

-- =====================================================
-- VERIFICACIONES FINALES
-- =====================================================

-- Verificar que todo esté correcto
SELECT 'Migración completada exitosamente' as status;
