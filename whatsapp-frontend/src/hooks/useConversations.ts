import { useEffect, useState, useCallback } from "react";
import { fetchConversations } from "../lib/conversation.api";
import { Conversation } from "../types/whatsapp";
import { API_BASE_URL } from "../config/api";

export function useConversations() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshConversations = async () => {
    try {
      setLoading(true);

      const [convRes, unreadRes] = await Promise.all([
        fetch(`${API_BASE_URL}/waid`).then(res => res.json()),
        fetch(`${API_BASE_URL}/unread-counts`).then(res => res.json())
      ]);

      // Combinar las respuestas
      const conversationsWithUnread = convRes.map((conv: any) => {
        const unread = unreadRes.find(
          (u: any) => u.wa_id === conv.wa_id
        );
        return {
          ...conv,
          unreadCount: unread ? unread.unreadCount : 0
        };
      });

      setConversations(conversationsWithUnread);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshConversations();
  }, []);

  return { conversations, loading, error, refreshConversations };
}