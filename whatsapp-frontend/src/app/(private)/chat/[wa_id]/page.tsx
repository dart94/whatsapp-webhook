// app/chats/[waId]/ChatPage.tsx
"use client";

import { useEffect, useCallback, useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { ChatHeader } from "@/components/ChatHeader";
import { MessageList } from "@/components/MessageList";
import TextBox from "@/components/ChatInput";
import { useSocket } from "@/hooks/UseSocket";
import {
  markMessagesAsRead,
  fetchMessagesByWaId,
} from "@/lib/conversation.api";
import { useChatStore } from "@/stores/useChatStore";
import { useConversationStore } from "@/stores/UseConversationStore";
import { getStoredToken } from "@/utils/auth";

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
      await refreshConversations(
        gid !== undefined ? { groupId: gid } : undefined
      );
    },
    [refreshConversations]
  );

  // 🚀 SOLUCIÓN: Un solo useEffect que maneja token Y carga de mensajes
  useEffect(() => {
    const initializePage = async () => {
      try {
        const storedToken = getStoredToken();
        if (!storedToken) {
          setError("No se encontró token de autenticación");
          setIsLoading(false);
          return;
        }

        // Actualizar token en el estado
        setToken(storedToken);
        setIsLoading(true);
        setError(null);

        try {
          const messagesFromDb = await fetchMessagesByWaId(
            storedToken,
            waId,
            groupId !== undefined ? { groupId } : undefined
          );
          setMessages(waId, messagesFromDb);
        } catch (fetchError) {
          console.error(
            "❌ [ChatPage] Error en fetchMessagesByWaId:",
            fetchError
          );
          throw fetchError;
        }

        try {
          await markMessagesAsRead(
            storedToken,
            waId,
            groupId !== undefined ? { groupId } : undefined
          );
        } catch (markError) {}

        try {
          console.log("🔄 [ChatPage] Refrescando conversaciones...");
          await doRefresh(groupId);
          console.log("🔄 [ChatPage] doRefresh completado");
        } catch (refreshError) {
          console.error(
            "⚠️ [ChatPage] Error en doRefresh (continuando):",
            refreshError
          );
          // No lanzar error aquí, es menos crítico
        }

        console.log("✅ [ChatPage] Carga completada exitosamente");
      } catch (err) {
        console.error("❌ [ChatPage] Error al cargar mensajes:", err);

        setError(
          err instanceof Error ? err.message : "Error al cargar mensajes"
        );
      } finally {
        console.log("🏁 [ChatPage] Finalizando carga (setIsLoading(false))");
        setIsLoading(false);
      }
    };

    initializePage();
  }, [waId, groupId, setMessages, doRefresh]);

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

  console.log("🎨 [ChatPage] Renderizando...");
  console.log("🎨 [ChatPage] isLoading:", isLoading);
  console.log("🎨 [ChatPage] error:", error);
  console.log("🎨 [ChatPage] currentMessages:", currentMessages?.length || 0);

  if (error) {
    console.log("🔴 [ChatPage] Mostrando error");
    return (
      <div className="p-4 text-red-500">
        <p>Error: {error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-2 px-4 py-2 bg-blue-500 text-white rounded"
        >
          Recargar página
        </button>
      </div>
    );
  }

  if (isLoading) {
    console.log("⏳ [ChatPage] Mostrando loading");
    return (
      <div className="p-4">
        <p>Cargando mensajes...</p>
        <p className="text-sm text-gray-500">
          Token: {token ? "✅" : "❌"} | WaId: {waId} | GroupId:{" "}
          {groupId || "ninguno"}
        </p>
      </div>
    );
  }

  return (
    <div className="h-full grid grid-rows-[auto,1fr,auto]">
      {/* Header fijo (fuera del scroll) */}
      <div className="bg-white border-b">
        <ChatHeader
          waId={waId}
          messageCount={currentMessages.length}
          onBack={onBack}
        />
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
