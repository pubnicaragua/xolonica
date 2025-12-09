-- Xolonica.store Database Schema
-- Note: This is for reference. Execute in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Businesses table
CREATE TABLE IF NOT EXISTS businesses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  ruc TEXT,
  category TEXT NOT NULL,
  city TEXT NOT NULL,
  municipality TEXT,
  neighborhood TEXT,
  address TEXT,
  phone TEXT NOT NULL,
  whatsapp TEXT,
  email TEXT,
  facebook TEXT,
  instagram TEXT,
  tiktok TEXT,
  website TEXT,
  logo_url TEXT,
  tagline TEXT,
  description TEXT,
  status TEXT DEFAULT 'pending', -- 'pending', 'verified', 'rejected'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Products table
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10, 2),
  image_url TEXT,
  available BOOLEAN DEFAULT true,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Chat messages table
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  sender_type TEXT NOT NULL, -- 'user' or 'business'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  phone TEXT,
  display_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_businesses_status ON businesses(status);
CREATE INDEX IF NOT EXISTS idx_businesses_category ON businesses(category);
CREATE INDEX IF NOT EXISTS idx_businesses_city ON businesses(city);
CREATE INDEX IF NOT EXISTS idx_products_business ON products(business_id);
CREATE INDEX IF NOT EXISTS idx_reviews_business ON reviews(business_id);
CREATE INDEX IF NOT EXISTS idx_chat_business_user ON chat_messages(business_id, user_id);

-- Row Level Security (RLS) policies
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Businesses: everyone can read verified, only owner can update
CREATE POLICY "Businesses are viewable by everyone"
  ON businesses FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own business"
  ON businesses FOR INSERT
  WITH CHECK (true);

-- Products: everyone can read
CREATE POLICY "Products are viewable by everyone"
  ON products FOR SELECT
  USING (true);

CREATE POLICY "Products can be inserted"
  ON products FOR INSERT
  WITH CHECK (true);

-- Reviews: everyone can read, authenticated users can insert
CREATE POLICY "Reviews are viewable by everyone"
  ON reviews FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create reviews"
  ON reviews FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Chat: users can only see their own chats
CREATE POLICY "Users can view their own chat messages"
  ON chat_messages FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own chat messages"
  ON chat_messages FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- User profiles
CREATE POLICY "Users can view their own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON user_profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Insert sample businesses
INSERT INTO businesses (name, ruc, category, city, municipality, address, phone, whatsapp, email, logo_url, tagline, description, status) VALUES
(
  'Gorras Nicaragua',
  '001-120424-0001U',
  'Comercio - Ropa y Accesorios',
  'Managua',
  'Managua',
  'Plaza Inter, Local 45',
  '+505 8888 1234',
  '+505 8888 1234',
  'info@gorrasnicaragua.com',
  null,
  'Las mejores gorras personalizadas de Nicaragua',
  'Gorras Nicaragua es tu destino #1 para gorras personalizadas de alta calidad. Ofrecemos diseños únicos, bordados personalizados y una amplia variedad de estilos para todos los gustos. Más de 10 años sirviendo a clientes satisfechos en todo el país.',
  'verified'
),
(
  'COMINSA',
  '001-030598-0002K',
  'Ferretería y Construcción',
  'Managua',
  'Managua',
  'Carretera Norte, Km 5.5',
  '+505 2222 3456',
  '+505 8777 3456',
  'ventas@cominsa.com.ni',
  null,
  'Materiales de construcción de calidad garantizada',
  'COMINSA es líder en distribución de materiales de construcción en Nicaragua. Contamos con más de 30 años de experiencia y ofrecemos productos de las mejores marcas internacionales. Ferretería completa, cemento, hierro, madera, acabados y más.',
  'verified'
),
(
  'Heydi MakeUp',
  '001-250320-0003P',
  'Belleza y Cuidado Personal',
  'Managua',
  'Managua',
  'Altamira, de Banpro 1c al norte',
  '+505 8555 7890',
  '+505 8555 7890',
  'heydi.makeup@gmail.com',
  null,
  'Maquillaje profesional para cada ocasión especial',
  'Heydi MakeUp ofrece servicios de maquillaje profesional para bodas, quinceañeras, graduaciones y todo tipo de eventos especiales. También ofrecemos clases de automaquillaje y venta de productos cosméticos de alta calidad. ¡Realza tu belleza natural!',
  'verified'
);

-- Insert sample products for each business
INSERT INTO products (business_id, name, description, price, available, notes) 
SELECT id, 'Gorra Clásica Bordada', 'Gorra 100% algodón con bordado personalizado', 150.00, true, 'Disponible en 10+ colores'
FROM businesses WHERE name = 'Gorras Nicaragua';

INSERT INTO products (business_id, name, description, price, available, notes) 
SELECT id, 'Gorra Snapback Premium', 'Gorra estilo snapback con visera plana', 200.00, true, 'Edición limitada'
FROM businesses WHERE name = 'Gorras Nicaragua';

INSERT INTO products (business_id, name, description, price, available, notes) 
SELECT id, 'Cemento Portland 50kg', 'Cemento gris de alta resistencia', 285.00, true, 'Precio por bolsa'
FROM businesses WHERE name = 'COMINSA';

INSERT INTO products (business_id, name, description, price, available, notes) 
SELECT id, 'Hierro Corrugado 3/8"', 'Varilla de hierro corrugado de 3/8 pulgadas', 45.00, true, 'Precio por unidad de 6 metros'
FROM businesses WHERE name = 'COMINSA';

INSERT INTO products (business_id, name, description, price, available, notes) 
SELECT id, 'Maquillaje para Novia', 'Servicio completo de maquillaje nupcial', 1500.00, true, 'Incluye prueba previa'
FROM businesses WHERE name = 'Heydi MakeUp';

INSERT INTO products (business_id, name, description, price, available, notes) 
SELECT id, 'Maquillaje Social', 'Maquillaje para eventos y ocasiones especiales', 800.00, true, 'Duración 2-3 horas'
FROM businesses WHERE name = 'Heydi MakeUp';
