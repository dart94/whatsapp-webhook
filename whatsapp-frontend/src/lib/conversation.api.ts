import { API_BASE_URL } from "../config/api";
import { Conversation, WhatsappMessage } from "../types/whatsapp";


//Muestra los conversaciones recientes por clientes unicos
export async function fetchConversations(): Promise<Conversation[]> {
  const res = await fetch(`${API_BASE_URL}/waid`);
  const json = await res.json();
  return json.data;
}

//Muestra los mensajes recientes de una conversación por cliente
export async function fetchMessagesByWaId(wa_id: string): Promise<WhatsappMessage[]> {
  const res = await fetch(`${API_BASE_URL}/messages/${wa_id}`);

if (!res.ok) {
  const text = await res.text();
  throw new Error(`Error HTTP ${res.status}: ${text}`);
}

const json = await res.json();
return json.data;
}

//Enviar un mensaje a una conversación
export async function replyToMessage(wa_id: string, message: string): Promise<WhatsappMessage> {
  const res = await fetch(`${API_BASE_URL}/message/reply`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      to: wa_id,
      message,
    }),
  });
  const json = await res.json();
  return json.data;
}

//Marcar mensajes como leídos
export async function markMessagesAsRead(wa_id: string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/mark-as-read/${wa_id}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  const json = await res.json();
}

//Obtener conteo de mensajes sin leer
export async function getUnreadCounts(): Promise<any> {
  const res = await fetch(`${API_BASE_URL}/unread-counts`);
  const json = await res.json();
  return json.data;
}