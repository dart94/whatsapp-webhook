import { apiFetch } from "@/services/appiFetch";

// Obtener un usuario por ID
export async function getUser(id: number) {
  return apiFetch(`/users/${id}`, { method: "GET" });
}

// Obtener todos los usuarios
export async function getUsers() {
  return apiFetch("/users", { method: "GET" });
}

// Crear usuario
export async function createUser(data: any) {
  return apiFetch("/users", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// Actualizar usuario
export async function updateUser(
  id: number,
  data: { name?: string; email?: string; isAdmin?: boolean; isActive?: boolean; groupId?: number }
) {
  const body = {
    name: data.name,
    email: data.email,
    isAdmin: data.isAdmin,
    isActive: data.isActive, 
    groupId: data.groupId,  
  };

  return apiFetch(`/users/${id}`, {
    method: "PUT", 
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

// Eliminar usuario
export async function deleteUser(id: number) {
  return apiFetch(`/users/${id}`, { method: "DELETE" });
}
