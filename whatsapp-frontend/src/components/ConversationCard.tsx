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
        <div className="flex justify-between items-center">
          <span className="text-gray-800">{conversation.wa_id}</span>

          {conversation.unreadCount > 0 && (
            <span className="bg-red-500 text-white text-xs font-bold rounded-full px-2 py-0.5">
              {conversation.unreadCount}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
