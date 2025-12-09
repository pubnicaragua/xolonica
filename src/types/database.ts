export interface Business {
  id: string;
  name: string;
  owner_id?: string;
  ruc?: string;
  category: string;
  city: string;
  municipality?: string;
  neighborhood?: string;
  address?: string;
  phone: string;
  whatsapp?: string;
  email?: string;
  facebook?: string;
  instagram?: string;
  tiktok?: string;
  website?: string;
  logo_url?: string;
  tagline?: string;
  description?: string;
  status: 'pending' | 'verified' | 'rejected';
  verification_level?: number;
  cedula_verified?: boolean;
  cedula_photo_url?: string;
  has_physical_store?: boolean;
  bank_account_name?: string;
  product_count?: number;
  created_at?: string;
  updated_at?: string;
}

export interface Product {
  id: string;
  business_id: string;
  name: string;
  description?: string;
  price?: number;
  image_url?: string;
  available: boolean;
  notes?: string;
  created_at?: string;
}

export interface Review {
  id: string;
  business_id: string;
  user_id: string;
  rating: number;
  comment?: string;
  created_at?: string;
  user_profiles?: {
    display_name?: string;
  };
}

export interface ChatMessage {
  id: string;
  business_id: string;
  user_id: string;
  message: string;
  sender_type: 'user' | 'business';
  created_at: string;
}

export interface UserProfile {
  id: string;
  phone?: string;
  display_name?: string;
  created_at?: string;
}

export const CATEGORIES = [
  'Comercio - Ropa y Accesorios',
  'Ferretería y Construcción',
  'Belleza y Cuidado Personal',
  'Restaurantes y Comida',
  'Tecnología y Electrónica',
  'Servicios Profesionales',
  'Salud y Bienestar',
  'Educación',
  'Automotriz',
  'Hogar y Decoración',
  'Deportes y Fitness',
  'Entretenimiento',
  'Otros',
];

export const NICARAGUA_CITIES = [
  'Managua',
  'León',
  'Granada',
  'Masaya',
  'Matagalpa',
  'Chinandega',
  'Estelí',
  'Jinotega',
  'Rivas',
  'Boaco',
  'Chontales',
  'Carazo',
  'Nueva Segovia',
  'Madriz',
  'RAAN',
  'RAAS',
  'Río San Juan',
];
