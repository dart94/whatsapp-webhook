// app/chats/[waId]/ChatPage.tsx
"use client";
import { useEffect, useCallback, useState } from "react";
import { ChatHeader } from "@/components/ChatHeader";
import { MessageList } from "@/components/MessageList";
import TextBox from "@/components/ChatInput";
import { useSocket } from "@/hooks/UseSocket";
import { markMessagesAsRead, fetchMessagesByWaId } from "@/lib/conversation.api";
import { useChatStore } from "@/stores/useChatStore";
import { useConversationStore } from "@/stores/UseConversationStore";

type ChatPageProps = {
  waId: string;
  onBack: () => void;
};

export default function ChatPage({ waId, onBack }: ChatPageProps) {
  const { messagesByWaId, setMessages } = useChatStore();
  const { refreshConversations } = useConversationStore();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar mensajes iniciales
  useEffect(() => {
    const loadInitialMessages = async () => {
      try {
        setIsLoading(true);
        const messagesFromDb = await fetchMessagesByWaId(waId);
        setMessages(waId, messagesFromDb);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error al cargar mensajes");
      } finally {
        setIsLoading(false);
      }
    };
    loadInitialMessages();
    markMessagesAsRead(waId);
  }, [waId, setMessages]);

  // Socket: refrescar conversaciones si llega mensaje del waId activo
  const handleSocketMessage = useCallback(
    (payload: any) => {
      if (payload?.wa_id === waId) refreshConversations();
    },
    [waId, refreshConversations]
  );

  useSocket(handleSocketMessage);

  const currentMessages = messagesByWaId[waId] || [];

  if (error) {
    return <div className="p-4 text-red-500">Error: {error}</div>;
  }

  return (
    // Grid con 3 filas: header (auto), contenido (1fr), textbox (auto)
    <div className="h-full grid grid-rows-[auto,1fr,auto]">
      {/* Header fijo (fuera del scroller) */}
      <div className="bg-white border-b">
        <ChatHeader waId={waId} messageCount={currentMessages.length} onBack={onBack} />
      </div>

      {/* Centro: NO scroll aquí; lo maneja MessageList */}
      <div className="min-h-0">
        <MessageList messages={currentMessages} loading={isLoading} />
      </div>

      {/* TextBox fijo abajo */}
      <div className="border-t bg-white">
        <TextBox waId={waId} />
      </div>
    </div>
  );
}
