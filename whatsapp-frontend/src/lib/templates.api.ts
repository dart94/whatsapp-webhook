import { API_BASE_URL } from "../config/api";
import { Template } from "../types/whatsapp";
import { SendTemplatePayload } from "../types/whatsapp";

//Obtener las plantillas
export async function fetchTemplates(token: string): Promise<Template[]> {
  const res = await fetch(`${API_BASE_URL}/templates`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`, 
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Error HTTP ${res.status}: ${text}`);
  }

  const json = await res.json();
  return json.data;
}


//Enviar mensajes por plantilla

export async function sendTemplateMessage(payload: SendTemplatePayload) {
  // Recuperar token de localStorage o sessionStorage
  const token = localStorage.getItem("token") || sessionStorage.getItem("token");

  if (!token) {
    console.error("❌ No se encontró token. El usuario debe iniciar sesión.");
    throw new Error("No se encontró token. Inicia sesión primero.");
  }

  const res = await fetch(`${API_BASE_URL}/message/template`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`, 
    },
    body: JSON.stringify(payload),
  });

  console.log("📤 Enviando plantilla con payload:", payload);
  const json = await res.json();
  return json.data;
}