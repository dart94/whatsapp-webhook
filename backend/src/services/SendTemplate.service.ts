import { PHONE_NUMBER_ID, ACCESS_TOKEN } from "../config/constants";
import { logInfo, logError } from "../utils/logger";


// Función para enviar un mensaje de template
export async function sendTemplateMessage(
  to: string,
  templateName: string,
  language: { code: string },
  parameters: string[]
) {
  const languageCode = typeof language === "string" ? language : language?.code;

  if (!languageCode) {
    throw new Error("Language code is missing!");
  }

  const body = {
    messaging_product: "whatsapp",
    to,
    type: "template",
    template: {
      name: templateName,
      language: {
        code: languageCode,
      },
      components: [
        {
          type: "body",
          parameters: parameters.map((param) => ({
            type: "text",
            text: param,
          })),
        },
      ],
    },
  };

  try {
    const response = await fetch(
      `https://graph.facebook.com/v19.0/${PHONE_NUMBER_ID}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${ACCESS_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      }
    );

    const data = await response.json();

    if (response.ok) {
      logInfo(`✅ Template message sent successfully: ${JSON.stringify(data)}`);
    } else {
      logError(`❌ Error sending template message: ${JSON.stringify(data)}`);
    }

    return data;
  } catch (error) {
    logError(`❌ Network error sending template: ${error}`);
    throw error;
  }
}
