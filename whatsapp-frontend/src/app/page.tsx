"use client";

import { useEffect, useState } from "react";
import { fetchRecentMessages } from "../lib/api";
import { WhatsappMessage } from "../types/whatsapp";

export default function Home() {
  const [messages, setMessages] = useState<WhatsappMessage[]>([]);

  useEffect(() => {
    async function load() {
      const data = await fetchRecentMessages();
      setMessages(data);
    }
    load();
  }, []);

  return (
    <main className="p-10">
      <h1 className="text-3xl font-bold mb-4 text-green-600">
        Mensajes Recientes
      </h1>

      <div className="grid gap-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className="p-4 border border-gray-300 rounded bg-gray-50 shadow hover:bg-green-50"
          >
            <strong className="block text-gray-700 mb-2">
              {msg.direction === "IN" ? "📥 IN" : "📤 OUT"}
            </strong>
            <div className="text-gray-900">{msg.body_text}</div>
            <small className="text-gray-500 block mt-2">
              ID: {msg.id} | WA ID: {msg.wa_id} 
            </small>
          </div>
        ))}
      </div>
    </main>
  );
}
