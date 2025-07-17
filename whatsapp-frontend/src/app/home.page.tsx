"use client";

import { useEffect } from "react";
import { PageHeader } from "../components/PageHeader";
import { ConversationList } from "../components/ConversationList";
import { Conversation } from "../types/whatsapp";
import { useSocket } from "../hooks/UseSocket";
import { useConversationStore } from "../stores/UseConversationStore";

type HomeProps = {
  onSelectChat: (waId: string) => void;
};

export default function Message({ onSelectChat }: HomeProps) {
  const {
    conversations,
    loading,
    error,
    refreshConversations,
  } = useConversationStore();

  useEffect(() => {
    refreshConversations();
  }, []);

  useSocket(() => refreshConversations());

  const handleConversationClick = (conversation: Conversation) => {
    console.log("Conversation clicked:", conversation.wa_id);
    onSelectChat(conversation.wa_id);
  };

  const handleRefresh = () => {
    refreshConversations();
  };

  if (error) {
    return (
      <main className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
              <span className="text-red-500 text-2xl">⚠️</span>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Error al cargar conversaciones
            </h3>
            <p className="text-gray-500 mb-4">{error}</p>
            <button
              onClick={handleRefresh}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              Reintentar
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <PageHeader
          title="Conversaciones"
          subtitle={`${conversations.length} conversaciones activas`}
          actions={
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              {loading ? "Cargando..." : "Actualizar"}
            </button>
          }
        />

        <ConversationList
          conversations={conversations}
          loading={loading}
          onConversationClick={handleConversationClick}
        />
      </div>
    </main>
  );
}
