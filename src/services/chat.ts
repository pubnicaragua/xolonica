// Servicio para chat en tiempo real con negocios
import { supabase } from '@/utils/supabase/client';

export interface BusinessMessage {
  id: string;
  business_id: string;
  sender_id: string | null;
  sender_type: 'customer' | 'business';
  message: string;
  read: boolean;
  created_at: string;
}

export async function sendBusinessMessage(
  businessId: string,
  message: string,
  senderType: 'customer' | 'business'
) {
  const { data: { user } } = await supabase.auth.getUser();
  
  const { data, error } = await supabase
    .from('business_messages')
    .insert({
      business_id: businessId,
      sender_id: user?.id || null,
      sender_type: senderType,
      message,
      read: false,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getBusinessMessages(businessId: string) {
  const { data, error } = await supabase
    .from('business_messages')
    .select('*')
    .eq('business_id', businessId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data as BusinessMessage[];
}

export async function markMessagesAsRead(businessId: string, senderType: 'customer' | 'business') {
  const { error } = await supabase
    .from('business_messages')
    .update({ read: true })
    .eq('business_id', businessId)
    .neq('sender_type', senderType);

  if (error) throw error;
}

export function subscribeToBusinessMessages(
  businessId: string,
  callback: (message: BusinessMessage) => void
) {
  const channel = supabase
    .channel(`business_messages:${businessId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'business_messages',
        filter: `business_id=eq.${businessId}`,
      },
      (payload) => {
        callback(payload.new as BusinessMessage);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
