import { WhatsappMessage } from "../types/whatsapp";
import { MessageBubble } from "./MessageBubble";
import { useEffect, useRef, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface MessageListProps {
  messages: WhatsappMessage[];
  loading?: boolean;
  compact?: boolean;
}

export function MessageList({
  messages,
  loading = false,
  compact = false,
}: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const prevMessagesLength = useRef(messages.length);

  // Efecto para detectar posición del scroll
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const threshold = 100; // Margen de 100px desde el fondo
      const currentPosition = container.scrollHeight - container.scrollTop - container.clientHeight;
      setIsAtBottom(currentPosition <= threshold);
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  // Efecto para scroll automático al recibir nuevos mensajes
  useEffect(() => {
    const container = containerRef.current;
    if (!container || !bottomRef.current) return;

    const hasNewMessages = messages.length > prevMessagesLength.current;
    prevMessagesLength.current = messages.length;

    // WhatsApp Web behavior:
    // 1. Always scroll to bottom on new messages if already at bottom
    // 2. Don't scroll if user has manually scrolled up
    // 3. Special case: initial load scrolls to bottom
    if ((isAtBottom && hasNewMessages) || messages.length <= 1) {
      // Usamos requestAnimationFrame para asegurar que el DOM está actualizado
      requestAnimationFrame(() => {
        bottomRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
        });
      });
    }
  }, [messages, isAtBottom]);

  // Agrupar mensajes consecutivos del mismo tipo
  const groupedMessages = useMemo(() => {
    return messages.map((message, index) => {
      const prevMessage = messages[index - 1];
      const nextMessage = messages[index + 1];

      return {
        ...message,
        isConsecutive: prevMessage?.direction === message.direction,
        isLastInGroup: nextMessage?.direction !== message.direction,
        uniqueKey: message.id ? `msg-${message.id}` : `temp-${index}-${Date.now()}`,
      };
    });
  }, [messages]);

  if (loading) {
    return (
      <div className="flex-1 p-4 space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <motion.div
            key={`loading-${i}`}
            className={`h-12 rounded-2xl bg-gray-200 animate-pulse ${
              i % 2 === 0 ? "w-2/3 ml-auto" : "w-1/2"
            }`}
          />
        ))}
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center max-w-sm">
          <h3 className="text-xl font-semibold text-gray-800 mb-3">
            No hay mensajes aún
          </h3>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="flex-1 overflow-y-auto scroll-smooth px-4 py-2"
      style={{ scrollBehavior: 'smooth' }}
    >
      <AnimatePresence>
        {groupedMessages.map((message) => (
          <motion.div
            key={message.uniqueKey}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            layout="position"
          >
            <MessageBubble
              message={message}
              compact={compact}
              isConsecutive={message.isConsecutive}
              isLastInGroup={message.isLastInGroup}
            />
          </motion.div>
        ))}
      </AnimatePresence>
      
      {/* Elemento invisible para el scroll automático */}
      <div 
        ref={bottomRef} 
        className="h-px" 
        aria-hidden="true"
      />
    </div>
  );
}