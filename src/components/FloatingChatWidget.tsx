'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MessageCircle, X, Loader2 } from 'lucide-react';
import { supabase } from '@/utils/supabase/client';
import { getOwnerInbox, type BusinessInboxItem } from '@/services/chat';

export function FloatingChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [items, setItems] = useState<BusinessInboxItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  const totalUnread = items.reduce(
    (sum, item) => sum + (item.unread_count || 0),
    0
  );

  useEffect(() => {
    loadUserAndInbox();
  }, []);

  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('business_inbox')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'business_messages',
        },
        () => {
          reloadInbox();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const loadUserAndInbox = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    setUser(user);

    if (!user) return;

    await reloadInbox();
  };

  const reloadInbox = async () => {
    setIsLoading(true);
    try {
      const data = await getOwnerInbox();
      setItems(data);
    } catch (error) {
      console.error('Error loading inbox:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return null; // No mostrar si no hay usuario autenticado
  }

  // Si no hay negocios con mensajes, no mostramos el botón ni el panel
  if (!isLoading && items.length === 0) {
    return null;
  }

  return (
    <>
      {/* Botón flotante abajo a la izquierda */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 left-6 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-3 rounded-full shadow-2xl hover:shadow-3xl hover:scale-105 transition-all z-50 flex items-center gap-2"
        >
          <MessageCircle className="w-5 h-5" />
          <span className="text-sm font-semibold hidden sm:inline">Mensajes negocios</span>
          {totalUnread > 0 && (
            <span className="ml-1 bg-red-500 text-white text-xs font-bold rounded-full min-w-[1.5rem] h-6 flex items-center justify-center px-1">
              {totalUnread > 9 ? '9+' : totalUnread}
            </span>
          )}
        </button>
      )}

      {/* Panel de bandeja de entrada */}
      {isOpen && (
        <div className="fixed bottom-6 left-6 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-gray-200 z-50 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              <div>
                <p className="text-sm font-semibold">Bandeja de mensajes</p>
                <p className="text-xs text-blue-100">Negocios que administras</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="hover:bg-white/20 p-1 rounded transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="max-h-80 overflow-y-auto bg-gray-50">
            {isLoading ? (
              <div className="flex items-center justify-center py-10">
                <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
              </div>
            ) : items.length === 0 ? (
              <div className="py-6 px-4 text-center text-gray-500 text-sm">
                Aún no tienes mensajes en tus negocios.
              </div>
            ) : (
              items.map((item) => (
                <button
                  key={item.business_id}
                  onClick={() => {
                    router.push(`/negocios/${item.business_id}`);
                    setIsOpen(false);
                  }}
                  className="w-full text-left px-4 py-3 flex items-center justify-between hover:bg-white transition border-b border-gray-100 last:border-b-0"
                >
                  <div className="flex-1 pr-3">
                    <p className="text-sm font-semibold text-gray-900">
                      {item.business_name}
                    </p>
                    {item.city && (
                      <p className="text-xs text-gray-500">{item.city}</p>
                    )}
                    {item.last_message && (
                      <p className="text-xs text-gray-600 mt-1 line-clamp-1">
                        {item.last_message}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    {item.last_message_at && (
                      <span className="text-[11px] text-gray-400">
                        {new Date(item.last_message_at).toLocaleTimeString('es-NI', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    )}
                    {item.unread_count > 0 && (
                      <span className="bg-red-500 text-white text-xs font-bold rounded-full min-w-[1.5rem] h-6 flex items-center justify-center px-1">
                        {item.unread_count > 9 ? '9+' : item.unread_count}
                      </span>
                    )}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </>
  );
}
