import { create } from "zustand";
import { WhatsappMessage } from "@/types/whatsapp";

interface ChatStore {
  messagesByWaId: Record<string, WhatsappMessage[]>;
  addMessageToChat: (waId: string, message: WhatsappMessage) => void;
  updateMessageInChat: (
    waId: string,
    messageId: number,
    updatedData: Partial<WhatsappMessage>
  ) => void;
  setMessages: (waId: string, messages: WhatsappMessage[]) => void;
}

export const useChatStore = create<ChatStore>((set) => ({
  messagesByWaId: {},

  addMessageToChat: (waId, message) =>
    set((state) => ({
      messagesByWaId: {
        ...state.messagesByWaId,
        [waId]: [...(state.messagesByWaId[waId] || []), message],
      },
    })),

  updateMessageInChat: (waId, messageId, updatedData) =>
    set((state) => ({
      messagesByWaId: {
        ...state.messagesByWaId,
        [waId]: (state.messagesByWaId[waId] || []).map((msg) =>
          msg.id === messageId ? { ...msg, ...updatedData } : msg
        ),
      },
    })),

  setMessages: (waId, messages) =>
    set((state) => ({
      messagesByWaId: {
        ...state.messagesByWaId,
        [waId]: messages,
      },
    })),
}));