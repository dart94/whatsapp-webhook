import { API_BASE_URL } from "../config/api";
import { Conversation, WhatsappMessage } from "../types/whatsapp";


//Muestra los conversaciones recientes por clientes unicos
export async function fetchConversations(
  token: string,
  opts?: { groupId?: number }
): Promise<Conversation[]> {
  const params = new URLSearchParams();
  if (opts?.groupId !== undefined) params.set("groupId", String(opts.groupId));
  const url = params.toString()
    ? `${API_BASE_URL}/waid?${params.toString()}`
    : `${API_BASE_URL}/waid`;

  const res = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`, // ✅
    },
    cache: "no-store",
  });

  if (res.status === 401) {
    const text = await res.text();
    throw new Error(`No autorizado: ${text}`);
  }
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Error HTTP ${res.status}: ${text}`);
  }

  const json = await res.json();
  return json.data ?? [];
}

//Muestra los mensajes recientes de una conversación por cliente
export async function fetchMessagesByWaId(
  token: string,
  waId: string,
  opts?: { groupId?: number }
) {
  const params = new URLSearchParams();
  if (opts?.groupId !== undefined) params.set("groupId", String(opts.groupId));
  const url = params.toString()
    ? `${API_BASE_URL}/messages/${encodeURIComponent(waId)}?${params.toString()}`
    : `${API_BASE_URL}/messages/${encodeURIComponent(waId)}`;

  const res = await fetch(url, {
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (res.status === 401) throw new Error("No autorizado (token inválido o expirado)");
  if (!res.ok) throw new Error(`Error HTTP ${res.status}: ${await res.text()}`);
  const json = await res.json();
  return json.data ?? [];
}


//Enviar un mensaje a una conversación
export async function replyToMessage(
  wa_id: string,
  message: string,
  token: string // token JWT del usuario
): Promise<WhatsappMessage> {
  const res = await fetch(`${API_BASE_URL}/message/reply`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`, // 🔹 pasamos el token
    },
    body: JSON.stringify({
      to: wa_id,
      message,
    }),
  });
  

  const json = await res.json();

  if (!res.ok || !json.success) {
    console.error("❌ Error en replyToMessage:", json);
    throw new Error(json.error?.message || json.message || 'Unknown error');
  }

  return json.data;
}

//Marcar mensajes como leídos
export async function markMessagesAsRead(
  token: string,
  waId: string,
  opts?: { groupId?: number }
) {
  const body = opts?.groupId !== undefined ? { groupId: opts.groupId } : {};
  const res = await fetch(`${API_BASE_URL}/messages/${encodeURIComponent(waId)}/read`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(body),
  });
  if (res.status === 401) throw new Error("No autorizado (token inválido o expirado)");
  if (!res.ok) throw new Error(`Error HTTP ${res.status}: ${await res.text()}`);
  return true;
}

//Obtener conteo de mensajes sin leer
export async function getUnreadCounts(): Promise<any> {
  const res = await fetch(`${API_BASE_URL}/unread-counts`);
  const json = await res.json();
  return json.data;
}