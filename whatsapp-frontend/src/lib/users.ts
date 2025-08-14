import { API_BASE_URL } from "@/config/api";

export async function getUser(id: string) {
  const response = await fetch(`${API_BASE_URL}/users/${id}`);
  return response.json();
}

export async function getUsers() {
  const response = await fetch(`${API_BASE_URL}/users`);
  return response.json();
}

export async function createUser(data: any) {
  const response = await fetch(`${API_BASE_URL}/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return response.json();
}

export async function updateUser(id: string, data: any) {
  const response = await fetch(`${API_BASE_URL}/users/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return response.json();
}

export async function deleteUser(id: string) {
  const response = await fetch(`${API_BASE_URL}/users/${id}`, {
    method: 'DELETE',
  });
  return response.json();
}