import { create } from "zustand";
import { Conversation } from "@/types/whatsapp";
import { fetchConversations } from "@/lib/conversation.api";

interface ConversationState {
  conversations: Conversation[];
  loading: boolean;
  error: string | null;
  refreshConversations: (token: string, opts?: { groupId?: number }) => Promise<void>;
}

export const useConversationStore = create<ConversationState>((set) => ({
  conversations: [],
  loading: false,
  error: null,

  refreshConversations: async (token, opts) => {
    try {
      if (!token) {
        set({ error: "No hay token disponible", loading: false });
        return;
      }
      set({ loading: true, error: null });
      const data = await fetchConversations(token, opts); // ✅ token se pasa SIEMPRE
      set({ conversations: data, loading: false });
    } catch (e) {
      console.error(e);
      set({ loading: false, error: "Ocurrió un error al cargar conversaciones." });
    }
  },
}));
