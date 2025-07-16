import { WhatsappMessage } from "../types/whatsapp";
import { motion } from "framer-motion";
import { memo, useMemo } from "react";

interface MessageBubbleProps {
  message: WhatsappMessage;
  showAvatar?: boolean;
  compact?: boolean;
  isConsecutive?: boolean; // Para agrupar mensajes consecutivos
  showTimestamp?: boolean;
  isLastInGroup?: boolean; // Para mostrar timestamp solo en el último del grupo
}

export const MessageBubble = memo(function MessageBubble({ 
  message, 
  showAvatar = true, 
  compact = false,
  isConsecutive = false,
  showTimestamp = true,
  isLastInGroup = true
}: MessageBubbleProps) {
  const isIncoming = message.direction === "IN";
  const isOutgoing = message.direction === "OUT";
  
  // Formatear timestamp de manera más eficiente
  const formattedTime = useMemo(() => {
    return new Date(message.createdAt).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }, [message.createdAt]);

  // Clases CSS calculadas una sola vez
  const bubbleClasses = useMemo(() => {
    const baseClasses = "px-3 py-2 max-w-xs lg:max-w-md break-words relative";
    const sizeClasses = compact ? "text-sm" : "text-base";
    
    if (isIncoming) {
      const roundingClasses = isConsecutive 
        ? "rounded-l-lg rounded-r-2xl rounded-tl-sm" 
        : "rounded-2xl rounded-tl-lg";
      return `${baseClasses} ${sizeClasses} ${roundingClasses} bg-white border border-gray-200 text-gray-800 shadow-sm`;
    } else {
      const roundingClasses = isConsecutive 
        ? "rounded-l-2xl rounded-r-lg rounded-tr-sm" 
        : "rounded-2xl rounded-tr-lg";
      return `${baseClasses} ${sizeClasses} ${roundingClasses} bg-green-500 text-white shadow-md`;
    }
  }, [isIncoming, isConsecutive, compact]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ 
        duration: 0.2, 
        ease: "easeOut",
        delay: Math.random() * 0.1 // Pequeña variación para efecto natural
      }}
      exit={{ opacity: 0, y: -10, scale: 0.95 }}
      className={`flex items-end gap-2 ${isOutgoing ? 'justify-end' : 'justify-start'} ${
        isConsecutive ? 'mb-1' : 'mb-3'
      }`}
    >
      {/* Avatar para mensajes entrantes */}
      {isIncoming && showAvatar && !isConsecutive && (
        <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm">
          <span className="text-xs text-white font-medium">👤</span>
        </div>
      )}
      
      {/* Espaciador para mantener alineación cuando no hay avatar */}
      {isIncoming && showAvatar && isConsecutive && (
        <div className="w-8 h-8 flex-shrink-0" />
      )}

      {/* Burbuja del mensaje */}
      <div className="flex flex-col">
        <div className={bubbleClasses}>
          <p className="leading-relaxed">{message.body_text}</p>
          
          {/* Timestamp integrado en la burbuja */}
          {showTimestamp && isLastInGroup && (
            <div className={`
              text-xs mt-1 flex items-center justify-end gap-1
              ${isIncoming ? 'text-gray-500' : 'text-green-100'}
            `}>
              <time 
                dateTime={message.createdAt}
                className="select-none"
              >
                {formattedTime}
              </time>
              {/* Indicador de estado del mensaje */}
              {isOutgoing && (
                <span 
                  className="text-green-200"
                  aria-label="Mensaje enviado"
                  role="img"
                >
                  ✓
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
});