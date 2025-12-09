-- ============================================
-- CREAR TABLA DE NOTIFICACIONES
-- ============================================

-- Crear tabla
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(50) NOT NULL, -- 'approval', 'rejection', 'registration', etc.
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índice para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);

-- Habilitar RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Policy: Los usuarios solo pueden ver sus propias notificaciones
CREATE POLICY "Usuarios pueden ver sus propias notificaciones"
  ON notifications
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Los usuarios pueden marcar como leídas sus propias notificaciones
CREATE POLICY "Usuarios pueden actualizar sus propias notificaciones"
  ON notifications
  FOR UPDATE
  USING (auth.uid() = user_id);

-- ============================================
-- TRIGGER PARA NOTIFICAR CUANDO SE REGISTRA UN NEGOCIO
-- ============================================

CREATE OR REPLACE FUNCTION notify_business_registration()
RETURNS TRIGGER AS $$
BEGIN
  -- Insertar notificación cuando se registra un nuevo negocio
  INSERT INTO notifications (user_id, title, message, type, read)
  VALUES (
    NEW.owner_id,
    'Tu negocio ha sido registrado',
    'Tu negocio "' || NEW.name || '" ha sido registrado exitosamente. Será revisado dentro de 48 horas.',
    'registration',
    false
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear trigger
DROP TRIGGER IF EXISTS trigger_notify_business_registration ON businesses;

CREATE TRIGGER trigger_notify_business_registration
  AFTER INSERT ON businesses
  FOR EACH ROW
  WHEN (NEW.owner_id IS NOT NULL)
  EXECUTE FUNCTION notify_business_registration();

-- ============================================
-- VERIFICAR QUE FUNCIONÓ
-- ============================================
-- SELECT * FROM notifications LIMIT 10;
