// /lib/group.ts
import { Group } from "@/types/groups";
import { apiFetch } from "@/services/appiFetch";

type FetchOpts = {
  signal?: AbortSignal;
};

/** Obtener grupos */
export async function getGroups(opts?: FetchOpts): Promise<Group[]> {
  const response = await apiFetch("/groups", { signal: opts?.signal });
  return response.data as Group[];
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
