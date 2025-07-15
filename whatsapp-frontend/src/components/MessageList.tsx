import { WhatsappMessage } from "../types/whatsapp";
import { MessageBubble } from "./MessageBubble";
import type { Conversation } from "../types/whatsapp";

interface MessageListProps {
  messages: WhatsappMessage[];
  loading?: boolean;
  compact?: boolean;
  onConversationClick?: (conversation: Conversation) => void;
}

export function MessageList({ messages, loading = false, compact = false, onConversationClick }: MessageListProps) {
  if (loading) {
    return (
      <div className="space-y-4 p-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className={`flex ${i % 2 === 0 ? 'justify-end' : 'justify-start'}`}>
            <div className="animate-pulse">
              <div className={`
                h-12 rounded-2xl
                ${i % 2 === 0 ? 'bg-green-200 w-48' : 'bg-gray-200 w-32'}
              `}></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <span className="text-gray-400 text-2xl">💬</span>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No hay mensajes
          </h3>
          <p className="text-gray-500">
            Cuando envíes o recibas mensajes, aparecerán aquí
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-1">
      {messages.map((message) => (
        <MessageBubble
          key={message.id}
          message={message}
          compact={compact}
        />
      ))}
    </div>
  );
}