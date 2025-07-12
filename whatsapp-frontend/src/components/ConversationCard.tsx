import Link from "next/link";
import { Conversation } from "../types/whatsapp";

interface ConversationCardProps {
  conversation: Conversation;
  onClick?: (conversation: Conversation) => void;
}

// TODO: Agregar propiedades de mensajes recibidos y enviados
export function ConversationCard({ conversation, onClick }: ConversationCardProps) {
  const handleClick = () => {
    onClick?.(conversation);
  };

  return (
    <Link
      href={`/chat/${conversation.wa_id}`}
      className="block group transition-all duration-200 hover:scale-[1.02]"
      onClick={handleClick}
    >
      <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
              <span className="text-gray-600 font-medium text-sm">
                {conversation.wa_id.slice(-2).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-gray-900 truncate">
                {conversation.wa_id}
              </h3>
              <p className="text-sm text-gray-500 truncate">
                {conversation.body_text || "Sin mensajes"}
              </p>
            </div>
          </div>
          <div className="flex flex-col items-end">
            <time className="text-xs text-gray-400">
              {new Date(conversation.createdAt).toLocaleDateString()}
            </time>
            <div className="w-2 h-2 bg-green-500 rounded-full mt-1 opacity-75"></div>
          </div>
        </div>
      </div>
    </Link>
  );
}