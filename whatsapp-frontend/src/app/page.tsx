"use client";

import { useState } from "react";
import Message from "./home.page";
import ChatPage from "./chat/[wa_id]/page";

export default function Home() {
  const [selectedWaId, setSelectedWaId] = useState<string | null>(null);
  console.log("🔥 selectedWaId:", selectedWaId);


  return (
    <main className="h-screen flex">
      {/* Columna izquierda: lista de chats */}
      <div className="w-1/3 border-r border-gray-200 overflow-y-auto">
        <Message onSelectChat={setSelectedWaId} />
      </div>

      {/* Columna derecha: chat activo */}
      <div className="flex-1 overflow-y-auto">
        {selectedWaId ? (
          <ChatPage
            waId={selectedWaId}
            onBack={() => {
              console.log("VOLVIENDO A HOME!");
              setSelectedWaId(null);
            }}
          />
        ) : (
          <div className="h-full flex items-center justify-center text-gray-400">
            Selecciona un chat para comenzar
          </div>
        )}
      </div>
    </main>
  );
}
