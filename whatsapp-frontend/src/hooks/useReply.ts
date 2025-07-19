import { useEffect, useState, useCallback } from "react";
import {replyToMessage} from "../lib/conversation.api";
import {WhatsappMessage} from "../types/whatsapp";

export function useReply(waId: string | undefined) {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = useCallback(async (): Promise<WhatsappMessage | null> => {
    if (!waId || !message.trim()) return null;

    try {
      setLoading(true);
      setError(null);

      const newMessage = await replyToMessage(waId, message);
      setMessage('');

      return newMessage; // ✅ devolver el mensaje enviado
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al enviar mensaje');
      return null;
    } finally {
      setLoading(false);
    }
  }, [waId, message]);

  return {
    message,
    loading,
    error,
    sendMessage,
    setMessage,
  };
}

