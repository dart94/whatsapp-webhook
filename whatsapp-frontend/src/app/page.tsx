"use client";

import Message from "./message.page";


export default function Home() {
  return (
    <main className="p-10">
      <h1 className="text-3xl font-bold mb-4 text-green-600">
        Whatsapp Webhook
      </h1>
      <Message />
    </main>
  );

}
