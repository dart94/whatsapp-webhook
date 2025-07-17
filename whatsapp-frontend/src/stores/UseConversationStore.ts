import { create } from "zustand";
import { Conversation } from "@/types/whatsapp";
import { API_BASE_URL } from "../config/api"; 

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
      const res = await fetch(`${API_BASE_URL}/messages/waid`);
      if (!res.ok) {
        throw new Error("Error al consultar el API");
      }
      const json = await res.json();
      console.log("✅ Conversations from API:", json.data);
      set({ conversations: json.data, loading: false });
    } catch (e: any) {
      console.error(e);
      set({
        loading: false,
        error: e.message || "Error al cargar conversaciones.",
      });
    }
  },
}));
