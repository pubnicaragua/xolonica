// Servicio para búsqueda de productos
import { supabase } from '@/utils/supabase/client';

export interface ProductSearchResult {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string | null;
  business_id: string;
  business_name: string;
  business_city: string;
  business_logo: string | null;
  verification_level: number;
}

export async function searchProducts(query: string, limit: number = 20) {
  const { data, error } = await supabase.rpc('search_products', {
    search_query: query,
    limit_count: limit,
  });

  if (error) {
    console.error('Error searching products:', error);
    return [];
  }

  return data as ProductSearchResult[];
}

export async function getRecentProducts(limit: number = 12) {
  const { data, error } = await supabase
    .from('products_with_business')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching recent products:', error);
    return [];
  }

  return data as ProductSearchResult[];
}

export async function createProduct(businessId: string, productData: any) {
  const { count } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true })
    .eq('business_id', businessId);

  if (count && count >= 10) {
    throw new Error('Has alcanzado el límite de 10 productos por negocio');
  }

  const { data, error } = await supabase
    .from('products')
    .insert({ ...productData, business_id: businessId })
    .select()
    .single();

  if (error) throw error;
  return data;
}
