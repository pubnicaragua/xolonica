import { supabase } from '@/utils/supabase/client';

export async function uploadBusinessLogo(businessId: string, file: File) {
  const ext = file.name.split('.').pop() || 'jpg';
  const path = `${businessId}/logo.${ext}`;

  const { error } = await supabase.storage
    .from('business-logos')
    .upload(path, file, {
      upsert: true,
      cacheControl: '3600',
    });

  if (error) throw error;

  const { data } = supabase.storage.from('business-logos').getPublicUrl(path);
  return data.publicUrl;
}

export async function uploadProductImage(
  businessId: string,
  productId: string,
  file: File,
) {
  const ext = file.name.split('.').pop() || 'jpg';
  const path = `${businessId}/${productId}.${ext}`;

  const { error } = await supabase.storage
    .from('product-images')
    .upload(path, file, {
      upsert: true,
      cacheControl: '3600',
    });

  if (error) throw error;

  const { data } = supabase.storage.from('product-images').getPublicUrl(path);
  return data.publicUrl;
}
