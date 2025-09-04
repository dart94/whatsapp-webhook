import { API_BASE_URL } from "../config/api";
import { TemplateStatsResult } from "../types/stats";

//Obtener todos los mensajes de plantilla
export async function fetchAllTemplateMessages(
  token: string
): Promise<TemplateStatsResult> {
  const res = await fetch(`${API_BASE_URL}/stats/template-messages`, {
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