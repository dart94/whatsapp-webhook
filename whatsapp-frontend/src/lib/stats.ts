import { API_BASE_URL } from "../config/api";
import { TemplateStatsResult } from "../types/stats";

// Obtener todos los mensajes de plantilla y convertir BigInt a string
export async function fetchAllTemplateMessages(
  token: string
): Promise<TemplateStatsResult> {
  const res = await fetch(`${API_BASE_URL}/stats/template-messages`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
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

  // Convertir todos los BigInt a string
  const serializedData = (json.data ?? []).map((msg: any) => ({
    ...msg,
    id: msg.id?.toString(),
    user: msg.user
      ? { ...msg.user, id: msg.user.id?.toString() }
      : null,
    group: msg.group
      ? { ...msg.group, id: msg.group.id?.toString(), groupId: msg.group.groupId?.toString() }
      : null,
  }));

  return serializedData;
}