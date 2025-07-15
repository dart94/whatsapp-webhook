import { API_BASE_URL } from "../config/api";
import { Template } from "../types/whatsapp";

//Obtener las plantillas
export async function fetchTemplates(): Promise<Template[]> {
  const res = await fetch(`${API_BASE_URL}/templates`);
  const json = await res.json();
  return json.data;
}

//Enviar mensajes por plantilla
export async function sendTemplateMessage(to: string, templateName: string, language: string, parameters: any[]): Promise<any> {
  const res = await fetch(`${API_BASE_URL}/message/template`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      to,
      templateName,
      language,
      parameters,
    }),
  });
  const json = await res.json();
  console.log(json);
  return json.data;
}