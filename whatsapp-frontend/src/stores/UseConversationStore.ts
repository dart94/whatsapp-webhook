import { create } from "zustand";
import { Conversation } from "@/types/whatsapp";
import { fetchConversations } from "@/lib/conversation.api";

interface ConversationState {
  conversations: Conversation[];
  loading: boolean;
  error: string | null;
  refreshConversations: (opts?: { groupId?: number }) => Promise<void>; // ✅ Sin token
}

export const useConversationStore = create<ConversationState>((set) => ({
  conversations: [],
  loading: false,
  error: null,

  refreshConversations: async (opts?: { groupId?: number }) => {
    try {
      // Obtener token dentro del store
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      
      if (!token) {
        set({ error: "No hay token disponible", loading: false });
        return;
      }
      
      set({ loading: true, error: null });
      const data = await fetchConversations(token, opts);
      set({ conversations: data, loading: false });
    } catch (e) {
      console.error(e);
      set({ loading: false, error: "Ocurrió un error al cargar conversaciones." });
    }
  },
}));