import { Conversation } from "../types/whatsapp";
import { ConversationCard } from "./ConversationCard";

interface ConversationListProps {
  conversations: Conversation[];
  loading?: boolean;
  onConversationClick?: (conversation: Conversation) => void;
}

export function ConversationList({
  conversations,
  loading = false,
  onConversationClick,
}: ConversationListProps) {
  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-white border border-gray-200 rounded-lg p-4 animate-pulse"
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                <div className="h-3 bg-gray-200 rounded w-3/4"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
          <span className="text-gray-400 text-2xl">💬</span>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No hay conversaciones
        </h3>
        <p className="text-gray-500">
          Las conversaciones aparecerán aquí cuando lleguen mensajes
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {conversations.map((conversation) => (
        <ConversationCard
          key={conversation.wa_id}
          conversation={conversation}
          onClick={() => {
            console.log("✅ Conversation clicked:", conversation.wa_id);
            onConversationClick?.(conversation);
          }}
        />
      ))}
    </div>
  );
}
