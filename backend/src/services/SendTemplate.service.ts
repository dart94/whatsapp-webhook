import { log } from "console";
import { logInfo, logError } from "../utils/logger";
import type { SendTemplatePayload } from "../interface/send.interface";



// Función para enviar mensaje por plantilla
export async function sendTemplateMessage(payload: SendTemplatePayload) {
  const { to, templateName, language, parameters = [], phoneNumberId, accessTokenId } = payload;

  if (!phoneNumberId || !accessTokenId) {
    throw new Error("phoneNumberId or accessTokenId missing");
  }

  const languageCode = typeof language === "string" ? language : language?.code;
  if (!languageCode) {
    throw new Error("Language code is missing!");
  }

  // Construir body para la API de WhatsApp
  const body = {
    messaging_product: "whatsapp",
    to,
    type: "template",
    template: {
      name: templateName,
      language: { code: languageCode },
      components: [
        {
          type: "body",
          parameters: parameters.map((param) => ({ type: "text", text: param })),
        },
      ],
    },
  };

  try {
    const res = await fetch(`https://graph.facebook.com/v19.0/${phoneNumberId}/messages`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessTokenId}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();

    if (res.ok) {
      logInfo(`✅ Template message sent: ${JSON.stringify(data)}`);
    } else {
      logError(`❌ Error sending template message: ${JSON.stringify(data)}`);
    }

    return data;
  } catch (error) {
    logError(`❌ Exception sending template message: ${error}`);
    throw error;
  }
}
