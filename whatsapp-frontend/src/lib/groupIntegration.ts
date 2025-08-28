//Conexión con el backend de groupIntegration
import { apiFetch } from "@/services/appiFetch";
import type { GroupIntegration } from "@/types/groupIntegration";

type FetchOpts = {
  signal?: AbortSignal;
};

//Obtener todos los grupos
type ApiResponse = { success?: boolean; data?: GroupIntegration[] } | GroupIntegration[];

export async function getGroupIntegrations(): Promise<GroupIntegration[]> {
  const json = (await apiFetch("/groupIntegration", { method: "GET" })) as ApiResponse;

  // Acepta tanto { success, data: [...] } como [...] plano
  if (Array.isArray(json)) return json;
  if (Array.isArray(json?.data)) return json.data;

  // si no vino nada, regresa arreglo vacío (evita excepciones)
  return [];
}

/** Obtener grupo por id */
export async function getGroupIntegrationById(id: number, opts?: FetchOpts): Promise<GroupIntegration> {
  const response = await apiFetch(`/groupIntegration/${id}`, { signal: opts?.signal });
  return response.data as GroupIntegration;
}

/** Crear grupo */
export async function createGroupIntegration(data: any) {
  const response = await apiFetch("/groupIntegration", {
    method: "POST",
    headers: { "Content-Type": "application/json" }, // ← si apiFetch no lo añade solo
    body: JSON.stringify(data),
  });
  return response.data as GroupIntegration;
}

/** Actualizar grupo */
export async function updateGroupIntegration(id: number, data: any) {
  const response = await apiFetch(`/groupIntegration/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" }, // ← idem
    body: JSON.stringify(data),
  });
  return response.data as GroupIntegration;
}

/** Eliminar grupo */
export async function deleteGroupIntegration(id: number): Promise<void> {
  await apiFetch(`/groupIntegration/${id}`, { method: "DELETE" });
}