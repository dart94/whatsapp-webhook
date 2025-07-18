
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


  return (
  <div
    className={`
      group relative bg-white border border-gray-200 rounded-xl 
      p-3 sm:p-4 transition-all duration-200 ease-in-out cursor-pointer
      hover:shadow-md hover:border-gray-300 hover:-translate-y-0.5
      ${isSelected ? "bg-green-50 border-green-300 shadow-md" : ""}
      ${conversation.unreadCount > 0 ? "border-l-4 border-l-green-500" : ""}
    `}
    onClick={() => onClick?.(conversation)}
  >
    <div className="flex items-start sm:items-center gap-3">
      {/* Avatar */}
      <div className="relative flex-shrink-0">
        <div
          className={`
            w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center
            transition-transform duration-200 group-hover:scale-105
            ${
              conversation.unreadCount > 0
                ? "bg-gradient-to-br from-green-400 to-green-600 text-white"
                : "bg-gradient-to-br from-gray-100 to-gray-200 text-gray-600"
            }
          `}
        >
          <span className="font-semibold text-sm sm:text-base">
            {getInitials(conversation.wa_id)}
          </span>
        </div>
      </div>

      {/* Contenido */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <h3
            className={`
              font-semibold truncate text-sm sm:text-base
              ${
                conversation.unreadCount > 0
                  ? "text-gray-900"
                  : "text-gray-700"
              }
            `}
          >
            {conversation.wa_id}
          </h3>

          {/* Etiqueta IN / OUT */}
          <span
            className={`
              hidden sm:inline-flex items-center justify-center
              min-w-[20px] h-5 px-1.5 text-xs font-bold rounded-full shadow-sm
              ${
                conversation.direction === "IN"
                  ? "text-green-500"
                  : "text-blue-500"
              }
            `}
          >
            {conversation.direction === "IN" ? "⬇️ Entrante" : "⬆️ Saliente"}
          </span>
        </div>

        <div className="flex items-center justify-between gap-2">
          {/* Último mensaje */}
          <p
            className={`
              text-sm truncate flex-1
              ${
                conversation.unreadCount > 0
                  ? "text-gray-800 font-medium"
                  : "text-gray-500"
              }
            `}
          >
            {conversation.body_text || "Sin mensaje"}
          </p>

          {/* Badge de no leídos */}
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
