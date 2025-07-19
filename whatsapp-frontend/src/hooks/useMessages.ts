import { useEffect, useState, useCallback } from "react";
import { fetchMessagesByWaId } from "../lib/conversation.api";
import { WhatsappMessage } from "../types/whatsapp";
import { useChatStore } from "@/stores/useChatStore";

export function useMessages(waId: string | undefined) {
  const [messages, setMessages] = useState<WhatsappMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadMessages = useCallback(async () => {
    if (!waId) return;
    
    try {
      setLoading(true);
      setError(null);
      const data = await fetchMessagesByWaId(waId);
      
      setMessages(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar mensajes');
    } finally {
      setLoading(false);
    }
  }, [waId]);

  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  const refreshMessages = async () => {
    await loadMessages();
  };

  const addMessage = (message: WhatsappMessage) => {
    setMessages(prev => [...prev, message]);
  };

  return {
    messages,
    loading,
    error,
    refreshMessages,
    addMessage
  };
}