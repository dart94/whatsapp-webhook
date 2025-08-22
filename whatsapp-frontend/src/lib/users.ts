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
export async function updateUser(id: number, data: any) {
  return apiFetch(`/users/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

// Eliminar usuario
export async function deleteUser(id: number) {
  return apiFetch(`/users/${id}`, { method: "DELETE" });
}
