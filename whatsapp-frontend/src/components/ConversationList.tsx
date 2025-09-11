"use client";

import { Conversation } from "../types/whatsapp";
import { ConversationCard } from "./ConversationCard";
import { motion, AnimatePresence } from "framer-motion";

interface ConversationListProps {
  conversations: Conversation[];
  loading?: boolean;
  onConversationClick?: (conversation: Conversation) => void;
}

export function ConversationList({
  conversations,
  loading = false,
  onConversationClick,
}: ConversationListProps) {
  if (loading) {
    return (
      <div className="space-y-4 p-4">
        {/* Loader animado superior */}
        <div className="flex justify-center items-center mb-6">
          <div className="flex space-x-2">
            <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce"></div>
            <div className="w-3 h-3 bg-purple-400 rounded-full animate-bounce [animation-delay:-0.2s]"></div>
            <div className="w-3 h-3 bg-purple-300 rounded-full animate-bounce [animation-delay:-0.4s]"></div>
          </div>
        </div>

        {/* Skeletons de carga */}
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-12 rounded-lg bg-gray-200 animate-pulse"
          ></div>
        ))}
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
          <span className="text-gray-400 text-2xl">💬</span>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No hay conversaciones
        </h3>
        <p className="text-gray-500">
          Las conversaciones aparecerán aquí cuando lleguen mensajes
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <AnimatePresence>
        {conversations.map((conversation) => (
          <motion.div
            key={conversation.wa_id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            <ConversationCard
              conversation={conversation}
              onClick={() => {
                onConversationClick?.(conversation);
              }}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
