//Vista principal de las conversaiones panel izquiedo de la izquierda y la conversacion activa en la derecha
"use client";

import { useState } from "react";
import Message from "../../home.page";
import ChatPage from "../chat/[wa_id]/page";
import Loader from "@/components/ui/Loader";

export default function Home() {
  const [selectedWaId, setSelectedWaId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (loading) return <Loader message="Cargando conversaciones" showTips={true} />;

  if (error) {
    return (
      <main className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
              <span className="text-red-500 text-2xl">⚠️</span>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Error al cargar conversaciones
            </h3>
            <p className="text-gray-500 mb-4">{error}</p>
            <button
              onClick={() => setError(null)}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              Reintentar
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="h-full flex min-h-0">
      {/* Columna izquierda: lista de chats */}
      <div className="w-1/3 border-r border-gray-200 h-full overflow-y-auto">
        <Message onSelectChat={setSelectedWaId} />
      </div>

      {/* Columna derecha: chat activo */}
      <div className="flex-1 flex flex-col min-h-0">
        {selectedWaId ? (
          <ChatPage waId={selectedWaId} onBack={() => setSelectedWaId(null)} />
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            Selecciona un chat para comenzar
          </div>
        )}
      </div>
    </main>
  );
}
