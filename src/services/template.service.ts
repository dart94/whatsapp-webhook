import { WABA_ID, ACCESS_TOKEN } from "../config/constants";
import { logInfo, logError } from "../utils/logger";

export async function getWhatsAppTemplates() {
  try {
    const response = await fetch(
      `https://graph.facebook.com/v19.0/${WABA_ID}/message_templates`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${ACCESS_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );

    const data = await response.json();

    if (response.ok) {
      logInfo("Templates obtenidos correcamente Total :${data.data.length}");
      return data.data;
    } else {
      logError("Error al obtener Templates");
      return [];
    }
  } catch (error) {
    logError("Error al obtener Templates");
    return [];
  }
}
