"use client";

import { useParams } from "next/navigation";
import { useReply } from "../hooks/useReply";

type ChatInputProps = {
  waId: string;
};

export default function ChatInput({ waId }: ChatInputProps) {


  const {
    message,
    setMessage,
    sendMessage,
    loading,
    error,
  } = useReply(waId);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="bg-white border-t border-gray-200 p-4">
      <div className="flex items-center space-x-2">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 bg-gray-100 rounded-full px-4 py-2 focus:outline-none"
          placeholder="Escribe un mensaje..."
          disabled={loading}
        />
        <button
          onClick={sendMessage}
          disabled={loading}
          className="bg-green-500 text-white p-2 rounded-full hover:bg-green-600 disabled:opacity-50"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"/>
          </svg>
        </button>
      </div>
      {error && (
        <div className="text-red-500 mt-2 text-sm">{error}</div>
      )}
    </div>
  );
}
