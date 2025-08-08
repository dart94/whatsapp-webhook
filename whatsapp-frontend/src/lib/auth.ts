import { API_BASE_URL } from "../config/api";

interface User {
  id: string;
  name: string;
  email: string;
}

interface LoginResponse {
  success: boolean;
  data?: {
    token: string;
    user: User | null;
  };
  message?: string;
}

//Login
export async function login(
  email: string,
  password: string,
  rememberMe: boolean
): Promise<LoginResponse> {
  const response = await fetch(`${API_BASE_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, rememberMe }),
  });

  const contentType = response.headers.get("Content-Type");

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Error ${response.status}: ${errorText}`);
  }

  if (!contentType?.includes("application/json")) {
    const text = await response.text();
    throw new Error(`Respuesta no JSON:\n${text}`);
  }

  const data: LoginResponse = await response.json();

  if (!data.success) {
    throw new Error(data.message || "Error al iniciar sesión");
  }

  // Guardar token
  if (data.data?.token) {
    if (rememberMe) {
      localStorage.setItem("token", data.data.token);
    } else {
      sessionStorage.setItem("token", data.data.token);
    }
  }

  return data;
}

//Validar token
export async function validateToken(): Promise<any> {
  const token =
    localStorage.getItem("token") || sessionStorage.getItem("token");

  if (!token) {
    return null;
  }

  const response = await fetch(`${API_BASE_URL}/auth/validateToken`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token }),
  });

  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(data.message || "Error al validar token");
  }

  return data.data;
}


//Logout
export async function logout() {
  try {
    // Solo limpiar tokens y redirigir
    localStorage.removeItem("token");
    sessionStorage.removeItem("token");
    
    // Opcional: llamar API si necesitas invalidar tokens en el servidor
    // await fetch('/api/auth/logout', { method: 'POST' });
    
    window.location.href = "/";
  } catch (error) {
    console.error('Error en logout:', error);
    window.location.href = "/"; // Redirigir de todos modos
  }
}