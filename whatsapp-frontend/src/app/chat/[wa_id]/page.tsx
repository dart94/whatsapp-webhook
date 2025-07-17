"use client";

import { ChatHeader } from "../../../components/ChatHeader";
import { MessageList } from "../../../components/MessageList";
import { useMessages } from "../../../hooks/useMessages";
import { useConversations } from "@/hooks/useConversations";
import TextBox from "../../../components/TextBox";
import { useSocket } from "../../../hooks/UseSocket";
import { markMessagesAsRead } from "@/lib/conversation.api";
import { useEffect } from "react";
import { useConversationStore } from "@/stores/UseConversationStore";

type ChatPageProps = {
  waId: string;
  onBack: () => void;
};

export default function ChatPage({ waId, onBack }: ChatPageProps) {
  const { messages, loading, error, refreshMessages } = useMessages(waId);
  const { refreshConversations } = useConversationStore();
  

  useSocket((payload) => {
    if (payload.wa_id === waId) {
      refreshMessages();
      refreshConversations();
      
    }
  });

  useEffect(() => {
    if (waId) {
      markMessagesAsRead(waId);
    }
  }, [waId]);

  if (error) {
    return <div className="p-4 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="h-full flex flex-col">
      <ChatHeader waId={waId} messageCount={messages.length} onBack={onBack} />
      <MessageList messages={messages} loading={loading} />
      <TextBox
        waId={waId}
        onSent={() => {
          refreshMessages();
          refreshConversations(); 
        }}
      />
    </div>
  );
}
