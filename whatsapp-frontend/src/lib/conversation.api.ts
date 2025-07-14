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
  console.log(json);
  return json.data;
}