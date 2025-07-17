// stores/useConversationStore.ts

import { create } from "zustand";
import { Conversation } from "@/types/whatsapp";
import { fetchConversations } from "@/lib/conversation.api";

interface ConversationState {
  conversations: Conversation[];
  loading: boolean;
  error: string | null;
  refreshConversations: () => Promise<void>;
}

export const useConversationStore = create<ConversationState>((set) => ({
  conversations: [],
  loading: false,
  error: null,
  refreshConversations: async () => {
    try {
      set({ loading: true, error: null });
      const data = await fetchConversations();
      set({ conversations: data, loading: false });
    } catch (e) {
      console.error(e);
      set({ loading: false, error: "Ocurrió un error al cargar conversaciones." });
    }
  },
}));
