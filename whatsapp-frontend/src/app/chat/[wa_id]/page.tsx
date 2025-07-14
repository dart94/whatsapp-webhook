"use client";

import { useParams } from "next/navigation";
import { ChatHeader } from "../../../components/ChatHeader";
import { MessageList } from "../../../components/MessageList";
import { useMessages } from "../../../hooks/useMessages";
import TextBox from "../../../components/TextBox";
import { useSocket } from "../../../hooks/UseSocket";

export default function ChatPage() {
  const params = useParams<{ wa_id: string }>();
  const waId = params.wa_id;
  const { messages, loading, error, refreshMessages } = useMessages(waId);

  useSocket(() => refreshMessages());

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
            <span className="text-red-500 text-2xl">⚠️</span>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Error al cargar mensajes
          </h3>
          <p className="text-gray-500 mb-4">{error}</p>
          <button
            onClick={refreshMessages}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  if (!waId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900">
            ID de conversación no válido
          </h3>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <ChatHeader 
        waId={waId} 
        messageCount={messages.length}
      />
      
      <MessageList 
        messages={messages} 
        loading={loading}
      />
      
      <TextBox waId={waId} />
    </div>
  );
}
