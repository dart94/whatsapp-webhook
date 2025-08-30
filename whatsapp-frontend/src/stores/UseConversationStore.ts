import { create } from "zustand";
import { Conversation } from "@/types/whatsapp";
import { fetchConversations } from "@/lib/conversation.api";

interface ConversationState {
  conversations: Conversation[];
  loading: boolean;
  error: string | null;
  refreshConversations: (opts?: { groupId?: number }) => Promise<void>;
}

export const useConversationStore = create<ConversationState>((set) => ({
  conversations: [],
  loading: false,
  error: null,

  refreshConversations: async (opts) => {
    try {
      set({ loading: true, error: null });
      const data = await fetchConversations(
        // aquí puedes pasar el token desde tu contexto/auth hook
        localStorage.getItem("token") || "",
        opts
      );
      set({ conversations: data, loading: false });
    } catch (e) {
      console.error(e);
      set({
        loading: false,
        error: "Ocurrió un error al cargar conversaciones.",
      });
    }
  },
}));
