import { API_BASE_URL } from "@/config/api";



function getToken() {
  return localStorage.getItem("token") || sessionStorage.getItem("token");
}

export async function apiFetch(path: string, options: RequestInit = {}) {
  const token = getToken();
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
  console.log("Header Authorization:", token ? `Bearer ${token}` : "ninguno");

  const res = await fetch(`${API_BASE_URL}${path}`, { ...options, headers });

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Error ${res.status}: ${txt}`);
  }

  return res.json();
}
