'use client';

import { useState, useEffect, useRef } from 'react';
import { Send, MessageCircle } from 'lucide-react';
import { supabase } from '@/utils/supabase/client';
import { AuthModal } from './AuthModal';
import type { ChatMessage } from '@/types/database';

interface ChatWidgetProps {
  businessId: string;
  businessName: string;
}

export function ChatWidget({ businessId, businessName }: ChatWidgetProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [user, setUser] = useState<any>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    checkUser();
    loadMessages();

    // Subscribe to new messages
    const channel = supabase
      .channel(`chat:${businessId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `business_id=eq.${businessId}`,
        },
        (payload) => {
          setMessages((current) => [...current, payload.new as ChatMessage]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [businessId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    setUser(session?.user ?? null);
  };

  const loadMessages = async () => {
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('business_id', businessId)
      .order('created_at', { ascending: true });

    if (!error && data) {
      setMessages(data);
    }
    setLoading(false);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }

    if (!newMessage.trim()) return;

    const { error } = await supabase.from('chat_messages').insert({
      business_id: businessId,
      user_id: user.id,
      message: newMessage,
      sender_type: 'user',
    });

    if (!error) {
      setNewMessage('');
    }
  };

  return (
    <>
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        {/* Chat header */}
        <div className="bg-[#003893] text-white px-6 py-4">
          <div className="flex items-center">
            <MessageCircle className="w-5 h-5 mr-2" />
            <h4>Chat con {businessName}</h4>
          </div>
        </div>

        {/* Messages area */}
        <div className="h-96 overflow-y-auto p-6 bg-gray-50">
          {loading ? (
            <div className="text-center text-gray-600">Cargando mensajes...</div>
          ) : messages.length === 0 ? (
            <div className="text-center text-gray-600">
              No hay mensajes aún. ¡Inicia la conversación!
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.user_id === user?.id ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-xs px-4 py-2 rounded-lg ${
                      message.user_id === user?.id
                        ? 'bg-[#003893] text-white'
                        : 'bg-white border border-gray-200 text-gray-900'
                    }`}
                  >
                    <p>{message.message}</p>
                    <span className="text-xs opacity-70 mt-1 block">
                      {new Date(message.created_at).toLocaleTimeString('es-NI', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Message input */}
        <form onSubmit={handleSendMessage} className="border-t border-gray-200 p-4">
          <div className="flex space-x-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder={
                user
                  ? 'Escribe un mensaje...'
                  : 'Inicia sesión para chatear...'
              }
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003893]"
            />
            <button
              type="submit"
              className="bg-[#003893] text-white px-4 py-2 rounded-lg hover:bg-[#0057B7] transition"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </form>
      </div>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </>
  );
}
