"use client";
import { useCallback, useState } from "react";
import { useChatStore } from "../stores/useChatStore";
import { WhatsappMessage } from "../types/whatsapp";
import { replyToMessage } from "../lib/conversation.api";

type ChatInputProps = {
  waId: string;
};

export default function ChatInput({ waId }: ChatInputProps) {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { addMessageToChat, updateMessageInChat } = useChatStore();

  const handleSend = useCallback(async () => {
    if (loading || !message.trim()) return;
    
    setError(null);
    setLoading(true);
    
    // 1. Crear mensaje optimista
    const tempId = Date.now();
    const optimisticMessage: WhatsappMessage = {
      id: tempId,
      message_id: `temp-${tempId}`,
      wa_id: waId,
      body_text: message,
      timestamp: Math.floor(Date.now() / 1000),
      type: 'outgoing',
      direction: 'OUT',
      status: 'sending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // 2. Añadir al store inmediatamente
    addMessageToChat(waId, optimisticMessage);
    setMessage('');

    try {
      // 3. Enviar al servidor
      const sentMessage = await replyToMessage(waId, message);
      
      // 4. Actualizar con la respuesta real
      updateMessageInChat(waId, tempId, {
        ...sentMessage,
        status: 'delivered'
      });
      
    } catch (err) {
      console.error('Error al enviar:', err);
      setError('Error al enviar mensaje');
      
      // 5. Marcar como fallado
      updateMessageInChat(waId, tempId, {
        status: 'failed'
      });
      
      setMessage(message); // Restaurar mensaje
    } finally {
      setLoading(false);
    }
  }, [loading, message, waId, addMessageToChat, updateMessageInChat]);


  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }, [handleSend]);

  const handleButtonClick = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    handleSend();
  }, [handleSend]);

  const handleFormSubmit = useCallback((e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    handleSend();
  }, [handleSend]);

  return (
    <div className="bg-white border-t border-gray-200 p-2">
      <form 
        onSubmit={handleFormSubmit} 
        className="flex items-center space-x-2"
        noValidate
      >
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 bg-gray-100 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50"
          placeholder="Escribe un mensaje..."
          disabled={loading}
          autoComplete="off"
        />
        <button
          type="submit"
          onClick={handleButtonClick}
          disabled={loading || !message.trim()}
          className="bg-purple-500 text-white p-2 rounded-full hover:bg-purple-600 disabled:opacity-50 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
          aria-label={loading ? "Enviando..." : "Enviar mensaje"}
        >
          {loading ? (
            <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"/>
            </svg>
          )}
        </button>
      </form>
      
      {error && (
        <div className="mt-2 text-red-500 text-sm">
          {error}
        </div>
      )}
    </div>
  );
}