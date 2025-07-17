
// Tarjeta de conversación con avatar y mensajes recibidos y enviados
import { Conversation } from "../types/whatsapp";

interface ConversationCardProps {
  conversation: Conversation;
  onClick?: (conversation: Conversation) => void;
  isSelected?: boolean;
}

export function ConversationCard({
  conversation,
  onClick,
  isSelected = false,
}: ConversationCardProps) {
  // Función para obtener las iniciales del nombre o ID
  const getInitials = (text: string): string => {
    return text.slice(-2).toUpperCase();
  };

  console.log("ConversationCard", conversation.wa_id, conversation.unreadCount);


  return (
    <div
      className={`
        group relative bg-white border border-gray-200 rounded-xl p-4 
        transition-all duration-200 ease-in-out cursor-pointer
        hover:shadow-md hover:border-gray-300 hover:-translate-y-0.5
        ${isSelected ? "bg-green-50 border-green-300 shadow-md" : ""}
        ${conversation.unreadCount > 0 ? "border-l-4 border-l-green-500" : ""}
      `}
      onClick={() => onClick?.(conversation)}
    >
      <div className="flex items-center space-x-3">
        {/* Avatar mejorado */}
        <div className="relative">
          <div
            className={`
            w-12 h-12 rounded-full flex items-center justify-center
            transition-all duration-200 group-hover:scale-105
            ${
              conversation.unreadCount > 0
                ? "bg-gradient-to-br from-green-400 to-green-600 text-white"
                : "bg-gradient-to-br from-gray-100 to-gray-200 text-gray-600"
            }
          `}
          >
            <span className="font-semibold text-sm">
              {getInitials(conversation.wa_id)}
            </span>
          </div>
        </div>

        {/* Contenido principal */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h3
              className={`
              font-semibold text-gray-900 truncate
              ${
                conversation.unreadCount > 0 ? "text-gray-900" : "text-gray-700"
              }
            `}
            >
              {conversation.wa_id}
            </h3>
            {/* IN o OUT */}
            <span
              className={`inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-xs font-bold rounded-full shadow-sm ${
                conversation.direction === "IN"
                  ? "text-green-500"
                  : "text-blue-500"
              }
  `}
            >
              {conversation.direction === "IN" ? "⬇️ Entrante" : "⬆️ Saliente"}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <p
              className={`
              text-sm truncate flex-1 mr-2
              ${
                conversation.unreadCount > 0
                  ? "text-gray-800 font-medium"
                  : "text-gray-500"
              }
            `}
            >
              {conversation.body_text || "Sin mensaje"}
            </p>

            {/* Badge de mensajes no leídos */}
            {conversation.unreadCount > 0 && (
              <div className="flex-shrink-0">
                <span
                  className="
                  inline-flex items-center justify-center
                  min-w-[20px] h-5 px-1.5
                  bg-gradient-to-r from-red-500 to-red-600
                  text-white text-xs font-bold rounded-full
                  shadow-sm
                "
                >
                  {conversation.unreadCount > 99
                    ? "99+"
                    : conversation.unreadCount}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
