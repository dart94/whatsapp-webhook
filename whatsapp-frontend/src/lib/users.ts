import { API_BASE_URL } from "@/config/api";

//Obtener usuario
export async function getUser(id: number) {
  const response = await fetch(`${API_BASE_URL}/users/${id}`);
  return response.json();
}

// Obtener usuarios
export async function getUsers() {
  const response = await fetch(`${API_BASE_URL}/users`);
  return response.json();
}

// Crear usuario
export async function createUser(data: any) {
  const response = await fetch(`${API_BASE_URL}/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return response.json();
}

// Actualizar usuario
export async function updateUser(id: number, data: any) {
  const response = await fetch(`${API_BASE_URL}/users/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return response.json();
}


// Eliminar usuario
export async function deleteUser(id: number) {
  const response = await fetch(`${API_BASE_URL}/users/${id}`, {
    method: 'DELETE',
  });
  return response.json();
}