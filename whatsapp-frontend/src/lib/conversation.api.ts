import { API_BASE_URL } from "../config/api";
import { Conversation, WhatsappMessage } from "../types/whatsapp";


//Obtener WAIDs únicos para home
export async function fetchConversations(): Promise<Conversation[]> {
  const res = await fetch(`${API_BASE_URL}/waid`);
  const json = await res.json();
  return json.data;
}

export async function fetchMessagesByWaId(wa_id: string): Promise<WhatsappMessage[]> {
  const res = await fetch(`${API_BASE_URL}/messages/${wa_id}`);
  const json = await res.json();
  return json.data;
}