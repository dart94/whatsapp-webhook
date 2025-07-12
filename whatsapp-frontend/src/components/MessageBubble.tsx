import { WhatsappMessage } from "../types/whatsapp";

interface MessageBubbleProps {
  message: WhatsappMessage;
  showAvatar?: boolean;
  compact?: boolean;
}

export function MessageBubble({ message, showAvatar = true, compact = false }: MessageBubbleProps) {
  const isIncoming = message.direction === "IN";
  const isOutgoing = message.direction === "OUT";

  return (
    <div className={`flex ${isOutgoing ? 'justify-end' : 'justify-start'} mb-3`}>
      <div className={`max-w-xs lg:max-w-md ${isOutgoing ? 'order-2' : 'order-1'}`}>
        {/* Avatar para mensajes entrantes */}
        {isIncoming && showAvatar && (
          <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center mb-1">
            <span className="text-xs text-gray-600">👤</span>
          </div>
        )}
        
        {/* Burbuja del mensaje */}
        <div
          className={`
            px-4 py-2 rounded-2xl shadow-sm
            ${isIncoming 
              ? 'bg-white border border-gray-200 text-gray-800' 
              : 'bg-green-500 text-white'
            }
            ${compact ? 'text-sm' : ''}
          `}
        >
          <p className="break-words">{message.body_text}</p>
          
          {/* Timestamp */}
          <div className={`
            text-xs mt-1 flex items-center gap-1
            ${isIncoming ? 'text-gray-500' : 'text-green-100'}
          `}>
            <span>{isIncoming ? '📥' : '📤'}</span>
            <time>{new Date(message.createdAt).toLocaleTimeString('es-ES', { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}</time>
          </div>
        </div>
      </div>
    </div>
  );
}