import { useEffect } from "react";
import { io } from "socket.io-client";

export function useSocket(onNewMessage: (payload: any) => void) {
  useEffect(() => {
    const socket = io("https://whatsapp-webhook-production-6e49.up.railway.app", {
      transports: ["websocket"],
    });

    socket.on("connect", () => {
    });

    socket.on("new_message", (payload) => {
      onNewMessage(payload);
    });

    return () => {
      socket.disconnect();
    };
  }, [onNewMessage]);
}
