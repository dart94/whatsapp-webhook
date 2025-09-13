// /lib/group.ts
import { Group } from "@/types/groups";
import { apiFetch } from "@/services/appiFetch";
import { API_BASE_URL } from "@/config/api";
import { getStoredToken } from "@/utils/auth";

type FetchOpts = {
  signal?: AbortSignal;
};

//Obtener todos los grupos
type ApiResponse = { success?: boolean; data?: Group[] } | Group[];

type GroupsResponse = {
  success: boolean;
  data: Group[];
};

// Carga de grupos (puedes mover esto a /lib/groups.api.ts si prefieres)
export async function fetchGroups(token?: string): Promise<Group[]> {
  if (!token) {
    getStoredToken();
  }

 try {
    const res = await fetch(`${API_BASE_URL}/groups`, {
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      cache: "no-store",
    });


    
    if (!res.ok) {
      // Obtener más detalles sobre el error
      const errorText = await res.text();
      console.error("Detalles del error de API:", errorText);
      throw new Error(`Error de API: ${res.status} - ${errorText}`);
    }
    
    const json = await res.json();
    console.log("Respuesta de API:", json);
    
    return json.data ?? [];
  } catch (error) {
    console.error("Error en fetchGroups:", error);
    throw error;
  }
}

//GetGroups
export async function getGroups(token: string): Promise<Group[]> {
  if (!token) {
    getStoredToken();
  }
  try {
    const res = await fetch(`${API_BASE_URL}/groups`, {
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      cache: "no-store",
    });
    if (!res.ok) {
      // Obtener más detalles sobre el error
      const errorText = await res.text();
      console.error("Detalles del error de API:", errorText);
      throw new Error(`Error de API: ${res.status} - ${errorText}`);
    }
    const json = await res.json();
    console.log("Respuesta de API:", json);
    return json.data ?? [];
  } catch (error) {
    console.error("Error en fetchGroups:", error);
    throw error;
  }
}



/** Obtener grupo por id */
export async function getGroupById(id: number, opts?: FetchOpts): Promise<Group> {
  const response = await apiFetch(`/groups/${id}`, { signal: opts?.signal });
  return response.data as Group;
}

/** Crear grupo */
export async function createGroup( token: string, name: string): Promise<Group> {
  const response = await apiFetch("/groups", {
    method: "POST",
    headers: { "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
     }, // ← si apiFetch no lo añade solo
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
