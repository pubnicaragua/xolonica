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

export interface BusinessInboxItem {
  business_id: string;
  business_name: string;
  city: string | null;
  last_message: string | null;
  last_message_at: string | null;
  unread_count: number;
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

export async function getOwnerInbox(): Promise<BusinessInboxItem[]> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const { data: businesses, error: businessError } = await supabase
    .from('businesses')
    .select('id, name, city, owner_id')
    .eq('owner_id', user.id);

  if (businessError) throw businessError;
  if (!businesses || businesses.length === 0) return [];

  const items: BusinessInboxItem[] = [];

  for (const business of businesses as any[]) {
    const { data: messages, error: msgError } = await supabase
      .from('business_messages')
      .select('id, message, created_at, read, sender_type')
      .eq('business_id', business.id)
      .order('created_at', { ascending: false })
      .limit(50);

    if (msgError) throw msgError;

    // Si aún no hay mensajes para este negocio, no lo incluimos en la bandeja
    if (!messages || messages.length === 0) {
      continue;
    }

    const last = messages[0];
    const unread = messages.filter(
      (m: any) => !m.read && m.sender_type === 'customer'
    ).length;

    items.push({
      business_id: business.id,
      business_name: business.name,
      city: business.city ?? null,
      last_message: last.message,
      last_message_at: last.created_at,
      unread_count: unread,
    });
  }

  return items;
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
