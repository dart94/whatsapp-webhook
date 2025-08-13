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

  // Detectar posición del scroll
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const threshold = 100;
      const currentPosition =
        container.scrollHeight - container.scrollTop - container.clientHeight;
      setIsAtBottom(currentPosition <= threshold);
    };

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, []);

  // Auto-scroll suave solo si ya estás abajo
  useEffect(() => {
    const container = containerRef.current;
    if (!container || !bottomRef.current) return;

    const hasNewMessages = messages.length > prevMessagesLength.current;
    prevMessagesLength.current = messages.length;

    if ((isAtBottom && hasNewMessages) || messages.length <= 1) {
      requestAnimationFrame(() => {
        bottomRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
        });
      });
    }
  }, [messages, isAtBottom]);

  // Auto-scroll inmediato siempre que cambie la lista
  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "auto", block: "nearest" });
    }
  }, [messages]);

  // Agrupar mensajes consecutivos
  const groupedMessages = useMemo(() => {
    return messages.map((message, index) => {
      const prevMessage = messages[index - 1];
      const nextMessage = messages[index + 1];
      return {
        ...message,
        isConsecutive: prevMessage?.direction === message.direction,
        isLastInGroup: nextMessage?.direction !== message.direction,
        uniqueKey: message.id
          ? `msg-${message.id}`
          : `temp-${index}-${Date.now()}`,
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
      className="h-full overflow-y-auto px-4 py-2"
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
      <div ref={bottomRef} className="h-px" aria-hidden="true" />
    </div>
  );
}
