// /lib/group.ts
import { Group } from "@/types/groups";
import { apiFetch } from "@/services/appiFetch";

type FetchOpts = {
  signal?: AbortSignal;
};

//Obtener todos los grupos
type ApiResponse = { success?: boolean; data?: Group[] } | Group[];

export async function getGroups(): Promise<Group[]> {
  const json = (await apiFetch("/groups", { method: "GET" })) as ApiResponse;

  // Acepta tanto { success, data: [...] } como [...] plano
  if (Array.isArray(json)) return json;
  if (Array.isArray(json?.data)) return json.data;

  // si no vino nada, regresa arreglo vacío (evita excepciones)
  return [];
}

/** Obtener grupo por id */
export async function getGroupById(id: number, opts?: FetchOpts): Promise<Group> {
  const response = await apiFetch(`/groups/${id}`, { signal: opts?.signal });
  return response.data as Group;
}

/** Crear grupo */
export async function createGroup(name: string): Promise<Group> {
  const response = await apiFetch("/groups", {
    method: "POST",
    headers: { "Content-Type": "application/json" }, // ← si apiFetch no lo añade solo
    body: JSON.stringify({ name }),
  });
  return response.data as Group;
}

/** Actualizar grupo */
export async function updateGroup(id: number, name: string): Promise<Group> {
  const response = await apiFetch(`/groups/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" }, // ← idem
    body: JSON.stringify({ name }),
  });
  return response.data as Group;
}

/** Eliminar grupo */
export async function deleteGroup(id: number): Promise<void> {
  await apiFetch(`/groups/${id}`, { method: "DELETE" });
}
