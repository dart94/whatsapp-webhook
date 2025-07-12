import { API_BASE_URL } from "../config/api";
import { WhatsappMessage } from "../types/whatsapp";

export async function fetchRecentMessages(): Promise<WhatsappMessage[]> {
  const res = await fetch(`${API_BASE_URL}/message/recent`);
  const json = await res.json();
  return json.data;
}