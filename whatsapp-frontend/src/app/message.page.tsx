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

  // Agrupar por wa_id
  const grouped = messages.reduce((acc, msg) => {
    if (!acc[msg.wa_id]) {
      acc[msg.wa_id] = [];
    }
    acc[msg.wa_id].push(msg);
    return acc;
  }, {} as Record<string, WhatsappMessage[]>);

  return (
    <main className="p-10">
      <h1 className="text-3xl font-bold mb-6 text-green-600">
        Chats
      </h1>
      <div className="space-y-8">
        {Object.entries(grouped).map(([wa_id, msgs]) => (
          <div key={wa_id}>
            <h2 className="text-xl font-bold mb-2 text-gray-800">
              Chat con {wa_id}
            </h2>
            <div className="space-y-2">
              {msgs.map((msg) => (
                <div
                  key={msg.id}
                  className={`p-3 rounded ${
                    msg.direction === "IN"
                      ? "bg-green-50 border border-green-300"
                      : "bg-blue-50 border border-blue-300 text-right"
                  }`}
                >
                  <div>{msg.body_text}</div>
                  <small className="text-gray-500">
                    {msg.direction === "IN" ? "📥 IN" : "📤 OUT"} | {msg.message_id}
                  </small>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
