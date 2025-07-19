import { useEffect, useRef, useCallback } from "react";
import { io, Socket } from "socket.io-client";

export function useSocket(onNewMessage: (payload: any) => void) {
  const socketRef = useRef<Socket | null>(null);
  const onNewMessageRef = useRef(onNewMessage);

  // Actualizar la referencia del callback sin recrear el socket
  useEffect(() => {
    onNewMessageRef.current = onNewMessage;
  }, [onNewMessage]);

  useEffect(() => {
    // Solo crear una conexión si no existe
    if (!socketRef.current) {
      console.log('Creando conexión WebSocket...');
      
      const socket = io("https://whatsapp-webhook-production-6e49.up.railway.app", {
        transports: ["websocket", "polling"], // Fallback a polling
        timeout: 10000,
        forceNew: true,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 2000,
      });

      socket.on("connect", () => {
        console.log('WebSocket conectado exitosamente');
      });

      socket.on("disconnect", (reason) => {
        console.log('WebSocket desconectado:', reason);
      });

      socket.on("connect_error", (error) => {
        console.error('Error de conexión WebSocket:', error);
      });

      // Usar la referencia del callback para evitar recrear listeners
      socket.on("new_message", (payload) => {
        console.log('Nuevo mensaje recibido:', payload);
        onNewMessageRef.current(payload);
      });

      socketRef.current = socket;
    }

    // Cleanup solo al desmontar el componente
    return () => {
      if (socketRef.current) {
        console.log('Desconectando WebSocket...');
        socketRef.current.removeAllListeners();
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, []); // Array vacío - solo se ejecuta al montar/desmontar

  return socketRef.current;
}