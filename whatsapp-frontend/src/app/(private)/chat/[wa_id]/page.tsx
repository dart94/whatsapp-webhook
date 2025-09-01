// app/chats/[waId]/ChatPage.tsx
"use client";

import { useEffect, useCallback, useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
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
  const searchParams = useSearchParams();

  const { messagesByWaId, setMessages } = useChatStore();
  const { refreshConversations } = useConversationStore();

  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Token desde localStorage (sólo en cliente)
  useEffect(() => {
    const t = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    setToken(t);
  }, []);

  // Lee groupId de la URL (?groupId=123)
  const groupId = useMemo(() => {
    const raw = searchParams.get("groupId");
    if (!raw) return undefined;
    const n = Number(raw);
    return Number.isNaN(n) ? undefined : n;
  }, [searchParams]);

  // Helper para refrescar conversaciones respetando token y groupId
  const doRefresh = useCallback(
    async (gid?: number) => {
      if (!token) return;
      await refreshConversations(token, gid !== undefined ? { groupId: gid } : undefined);
    },
    [token, refreshConversations]
  );

  // Cargar mensajes iniciales del chat activo
  useEffect(() => {
    if (!token) return; // no dispares sin token
    const loadInitialMessages = async () => {
      try {
        setIsLoading(true);
        const messagesFromDb = await fetchMessagesByWaId(
          token,
          waId,
          groupId !== undefined ? { groupId } : undefined
        );
        setMessages(waId, messagesFromDb);
        // marcar como leídos en este grupo
        await markMessagesAsRead(
          token,
          waId,
          groupId !== undefined ? { groupId } : undefined
        );
        // refrescar la lista de conversaciones (contadores, orden)
        await doRefresh(groupId);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error al cargar mensajes");
      } finally {
        setIsLoading(false);
      }
    };
    loadInitialMessages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [waId, token, groupId, setMessages, doRefresh]);

  // Socket: si llega mensaje del mismo waId activo, refrescamos lista de conversaciones
  const handleSocketMessage = useCallback(
    (payload: any) => {
      if (!token) return;
      if (!waId || payload?.wa_id === waId) {
        void doRefresh(groupId);
      }
    },
    [token, waId, groupId, doRefresh]
  );

  useSocket(handleSocketMessage);

  const currentMessages = messagesByWaId[waId] || [];

  if (error) {
    return <div className="p-4 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="h-full grid grid-rows-[auto,1fr,auto]">
      {/* Header fijo (fuera del scroll) */}
      <div className="bg-white border-b">
        <ChatHeader waId={waId} messageCount={currentMessages.length} onBack={onBack} />
      </div>

      <div className="min-h-0">
        <MessageList messages={currentMessages} loading={isLoading} />
      </div>

      {/* TextBox fijo abajo */}
      <div className="border-t bg-white">
        {/* Si tu TextBox necesita token/groupId, pásalos como props o que los lea internamente */}
        <TextBox waId={waId} />
      </div>
    </div>
  );
}
