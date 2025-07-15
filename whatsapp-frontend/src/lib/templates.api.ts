import { API_BASE_URL } from "../config/api";
import { Template } from "../types/whatsapp";

//Obtener las plantillas
export async function fetchTemplates(): Promise<Template[]> {
  const res = await fetch(`${API_BASE_URL}/templates`);
  const json = await res.json();
  return json.data;
}