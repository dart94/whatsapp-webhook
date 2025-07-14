import { Server } from "socket.io";
import { Server as HTTPServer } from "http";

let io: Server | null = null;

export function initSocket(server: HTTPServer) {
  io = new Server(server, {
    cors: {
      origin: "*",
    },
  });

  io.on("connection", (socket) => {
    console.log("🔥 Cliente conectado vía Socket.io");

    socket.on("disconnect", () => {
      console.log("👋 Cliente desconectado");
    });
  });
}

export function emitEvent(event: string, payload: any) {
  if (io) {
    io.emit(event, payload);
  } else {
    console.log("⚠️ Socket.io no inicializado todavía");
  }
}
