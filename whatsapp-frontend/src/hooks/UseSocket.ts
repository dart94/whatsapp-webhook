import { useEffect } from "react";
import { io } from "socket.io-client";
import { API_BASE_URL } from "@/config/api";

export function useSocket(onMessage: () => void) {
  useEffect(() => {
    const socket = io("${API_BASE_URL}", {
      transports: ["websocket"],
    });

    socket.on("connect", () => {
      console.log("✅ Conectado a WebSocket!");
    });

    socket.on("new_message", () => {
      console.log("🔥 Nuevo mensaje recibido vía socket!");
      onMessage();
    });

    return () => {
      socket.disconnect();
    };
  }, [onMessage]);
}
