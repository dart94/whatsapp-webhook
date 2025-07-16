import { useCallback } from "react";
import { markMessagesAsRead } from "../lib/conversation.api";

export function useMarkMessages(waId: string | undefined) {
  const markMessages = useCallback(async () => {
    if (!waId) return;
    try {
      await markMessagesAsRead(waId);
    } catch (err) {
      console.error(err);
    }
  }, [waId]);

  return markMessages;
}