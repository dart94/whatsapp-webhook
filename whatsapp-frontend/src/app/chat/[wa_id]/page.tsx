"use client";

import { useEffect, useState } from "react";
import { fetchMessagesByWaId } from "../../../lib/conversation.api";
import { WhatsappMessage } from "../../../types/whatsapp";
import { useParams } from "next/navigation";

export default function ChatPage() {
  const [messages, setMessages] = useState<WhatsappMessage[]>([]);
  const params = useParams<{ wa_id: string }>();
  const wa_id = params.wa_id;

  useEffect(() => {
    if (!wa_id) return;

    async function load() {
      const data = await fetchMessagesByWaId(wa_id);
      setMessages(data);
    }

    load();
  }, [wa_id]);

  return (
    <main className="p-10">
      <h1 className="text-2xl font-bold mb-4">
        Chat con {wa_id}
      </h1>

      <div className="space-y-2">
        {messages.map((msg) => (
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
              {msg.direction === "IN" ? "📥 IN" : "📤 OUT"} |{" "}
              {new Date(msg.createdAt).toLocaleString()}
            </small>
          </div>
        ))}
      </div>
    </main>
  );
}
