"use client";

import { useEffect, useState } from "react";
import { fetchRecentMessages } from "../lib/api";
import { WhatsappMessage } from "../types/whatsapp";

export default function Home() {
  const [messages, setMessages] = useState<WhatsappMessage[]>([]);

  useEffect(() => {
    async function load() {
      const data = await fetchRecentMessages();
      console.log(data);
      setMessages(data);
    }
    load();
  }, []);

  return (
    <main style={{ padding: 20 }}>
      <h1>Mensajes Recientes</h1>
      {messages.map((msg) => (
        <div key={msg.id} style={{
          marginBottom: 10,
          padding: 10,
          border: "1px solid #ccc",
          borderRadius: 4
        }}>
          <strong>{msg.direction === "IN" ? "📥 IN" : "📤 OUT"}</strong>
          <div>{msg.body_text}</div>
          <small>{msg.message_id}</small>
        </div>
      ))}
    </main>
  );
}
