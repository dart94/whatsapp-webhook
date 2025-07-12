"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { fetchConversations } from "../lib/conversation.api";
import { Conversation } from "../types/whatsapp";

export default function Home() {
  const [conversations, setConversations] = useState<Conversation[]>([]);

  useEffect(() => {
    async function load() {
      const data = await fetchConversations();
      setConversations(data);
    }
    load();
  }, []);

  return (
    <main className="p-10">
      <h1 className="text-3xl font-bold mb-6 text-green-600">
        Chats
      </h1>
      <div className="space-y-4">
        {conversations.map((conv) => (
          <Link
            href={`/chat/${conv.wa_id}`}
            key={conv.wa_id}
            className="block p-4 border border-gray-300 rounded hover:bg-green-50"
          >
            <div className="text-gray-800 font-semibold">
              {conv.wa_id}
            </div>
            <div className="text-gray-600">
              {conv.body_text || "Sin mensajes"}
            </div>
            <div className="text-gray-400 text-sm">
              {new Date(conv.createdAt).toLocaleString()}
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
