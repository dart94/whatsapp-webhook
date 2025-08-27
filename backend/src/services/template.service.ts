import { logInfo, logError } from "../utils/logger";

// 🔹 Ahora recibe token y wabaId dinámicos
export async function getWhatsAppTemplates(token: string, wabaId: string) {
  try {
    const response = await fetch(
      `https://graph.facebook.com/v19.0/${wabaId}/message_templates`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    const data = await response.json();

    if (response.ok) {
      logInfo(`Templates obtenidos correctamente. Total: ${data.data?.length || 0}`);
      return data.data || [];
    } else {
      logError(`❌ Error al obtener Templates: ${JSON.stringify(data)}`);
      return [];
    }
  } catch (error) {
    logError(`❌ Error en fetch de Templates: ${error}`);
    return [];
  }
}
