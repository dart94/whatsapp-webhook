import { logInfo, logError } from "../utils/logger";

interface WhatsAppTemplate {
  name: string;
  language: string;
  category: string;
  // otros campos que necesites
}

/**
 * Obtener templates de WhatsApp usando un token dinámico de usuario
 * @param accessToken Token de acceso de la integración del usuario
 */
export async function getWhatsAppTemplates(accessToken: string): Promise<WhatsAppTemplate[]> {
  if (!accessToken) {
    logError("❌ No se proporcionó accessToken");
    return [];
  }

  try {
    const response = await fetch(
      `https://graph.facebook.com/v19.0/${process.env.WABA_ID}/message_templates`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    const data = await response.json();

    if (response.ok) {
      logInfo(`✅ Templates obtenidos correctamente. Total: ${data.data.length}`);
      return data.data;
    } else {
      logError(`❌ Error al obtener Templates: ${JSON.stringify(data)}`);
      return [];
    }
  } catch (error) {
    logError(`❌ Error al obtener Templates: ${error}`);
    return [];
  }
}
