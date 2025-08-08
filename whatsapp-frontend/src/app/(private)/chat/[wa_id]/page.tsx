"use client";
import { useEffect, useCallback, useState } from "react";
import { ChatHeader } from "../../../../components/ChatHeader";
import { MessageList } from "../../../../components/MessageList";
import TextBox from "../../../../components/ChatInput";
import { useSocket } from "../../../../hooks/UseSocket";
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

  // Cargar mensajes iniciales desde la BD
  useEffect(() => {
    const loadInitialMessages = async () => {
      try {
        setIsLoading(true);
        const messagesFromDb = await fetchMessagesByWaId(waId);
        setMessages(waId, messagesFromDb);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar mensajes');
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialMessages();
    markMessagesAsRead(waId);
  }, [waId, setMessages]);

  // Manejo de mensajes entrantes via socket
  const handleSocketMessage = useCallback((payload: any) => {
    if (payload.wa_id === waId) {
      refreshConversations();
    }
  }, [waId, refreshConversations]);

  useSocket(handleSocketMessage);

  // Mensajes combinados: BD + optimistas
  const currentMessages = messagesByWaId[waId] || [];

  if (error) {
    return <div className="p-4 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="h-full flex flex-col">
      <ChatHeader waId={waId} messageCount={currentMessages.length} onBack={onBack} />
      <MessageList messages={currentMessages} loading={isLoading} />
      <TextBox waId={waId} />
    </div>
  );
}