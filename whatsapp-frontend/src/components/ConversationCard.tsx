import { Conversation } from "../types/whatsapp";

interface ConversationCardProps {
  conversation: Conversation;
  onClick?: (conversation: Conversation) => void;
}

export function ConversationCard({
  conversation,
  onClick,
}: ConversationCardProps) {
  return (
    <div
      className="bg-white border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer"
      onClick={() => onClick?.(conversation)}
    >
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
          <span className="text-green-600 font-medium text-sm">
            {conversation.wa_id.slice(-2).toUpperCase()}
          </span>
        </div>
        <div className="flex-1">
          <p className="text-gray-900 font-medium">{conversation.wa_id}</p>
          <p className="text-gray-500 text-sm truncate">
            {conversation.body_text || "Sin mensaje"}
          </p>
        </div>
      </div>
    </div>
  );
}
