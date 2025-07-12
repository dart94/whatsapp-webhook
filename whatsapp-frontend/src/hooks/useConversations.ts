import { useEffect, useState, useCallback } from "react";
import { fetchConversations } from "../lib/conversation.api";
import { Conversation } from "../types/whatsapp";

export function useConversations() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadConversations = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchConversations();
      setConversations(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar conversaciones');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  const refreshConversations = async () => {
    await loadConversations();
  };

  return {
    conversations,
    loading,
    error,
    refreshConversations
  };
}