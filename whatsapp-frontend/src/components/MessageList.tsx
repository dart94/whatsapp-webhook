import { WhatsappMessage } from "../types/whatsapp";
import { MessageBubble } from "./MessageBubble";
import type { Conversation } from "../types/whatsapp";
import { useEffect, useRef, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface MessageListProps {
  messages: WhatsappMessage[];
  loading?: boolean;
  compact?: boolean;
  onConversationClick?: (conversation: Conversation) => void;
}

export function MessageList({
  messages,
  loading = false,
  compact = false,
  onConversationClick,
}: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll mejorado con verificación de posición
  const scrollToBottom = useCallback(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ 
        behavior: "smooth",
        block: "end"
      });
    }
  }, []);

useEffect(() => {
  scrollToBottom();
}, [messages, scrollToBottom]);

  // Agrupar mensajes consecutivos para mejor UX
  const groupedMessages = useMemo(() => {
    return messages.map((message, index) => {
      const prevMessage = messages[index - 1];
      const nextMessage = messages[index + 1];
      
      const isConsecutive = prevMessage && 
        prevMessage.direction === message.direction &&
        new Date(message.createdAt).getTime() - new Date(prevMessage.createdAt).getTime() < 300000; // 5 minutos
      
      const isLastInGroup = !nextMessage || 
        nextMessage.direction !== message.direction ||
        new Date(nextMessage.createdAt).getTime() - new Date(message.createdAt).getTime() >= 300000;

      return {
        ...message,
        isConsecutive,
        isLastInGroup
      };
    });
  }, [messages]);

  // Loading state mejorado
  if (loading) {
    return (
      <div className="flex-1 p-4 space-y-3" role="status" aria-label="Cargando mensajes">
        {[1, 2, 3, 4].map((i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            className={`h-12 rounded-2xl bg-gradient-to-r from-gray-200 to-gray-300 animate-pulse ${
              i % 2 === 0 ? 'w-2/3 ml-auto' : 'w-1/2'
            }`}
          />
        ))}
        <span className="sr-only">Cargando mensajes...</span>
      </div>
    );
  }

  // Empty state mejorado
  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-sm"
        >
          <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-green-100 to-green-200 rounded-full flex items-center justify-center shadow-lg">
            <span className="text-green-600 text-3xl" role="img" aria-label="Chat">💬</span>
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-3">
            No hay mensajes aún
          </h3>
          <p className="text-gray-500 leading-relaxed">
            Aquí aparecerán tus conversaciones cuando envíes o recibas mensajes
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className="flex-1 overflow-y-auto p-4 scroll-smooth"
      role="log"
      aria-label="Lista de mensajes"
    >
      <AnimatePresence mode="popLayout">
        {groupedMessages.map((message, index) => (
          <motion.div
            key={message.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ 
              duration: 0.3,
              delay: index * 0.02, // Animación escalonada
              ease: "easeOut"
            }}
            layout
          >
            <MessageBubble
              message={message}
              compact={compact}
              isConsecutive={message.isConsecutive}
              isLastInGroup={message.isLastInGroup}
              showTimestamp={message.isLastInGroup}
            />
          </motion.div>
        ))}
      </AnimatePresence>
      
      {/* Indicador de scroll al final */}
      <div 
        ref={bottomRef} 
        className="h-4"
        aria-hidden="true"
      />
    </div>
  );
}