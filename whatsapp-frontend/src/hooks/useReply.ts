import { useEffect, useState, useCallback } from "react";
import {replyToMessage} from "../lib/conversation.api";
import {WhatsappMessage} from "../types/whatsapp";

export function useReply(waId: string | undefined) {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = useCallback(async () => {
    if (!waId || !message.trim()) return;

    try {
      setLoading(true);
      setError(null);
      const data = await replyToMessage(waId, message);
      setMessage('');
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al enviar mensaje');
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
