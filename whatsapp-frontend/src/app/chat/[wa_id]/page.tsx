"use client";
import { useParams } from "next/navigation";
import { ChatHeader } from "../../../components/ChatHeader";
import { MessageList } from "../../../components/MessageList";
import { useMessages } from "../../../hooks/useMessages";

export default function ChatPage() {
  const params = useParams<{ wa_id: string }>();
  const waId = params.wa_id;
  const { messages, loading, error, refreshMessages } = useMessages(waId);

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
      
      {/* Área para futuro input de mensajes */}
      <div className="bg-white border-t border-gray-200 p-4">
        <div className="flex items-center space-x-2">
          <div className="flex-1 bg-gray-100 rounded-full px-4 py-2">
            <span className="text-gray-500">Próximamente: enviar mensajes</span>
          </div>
          <button 
            disabled 
            className="bg-gray-300 text-gray-500 p-2 rounded-full"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}