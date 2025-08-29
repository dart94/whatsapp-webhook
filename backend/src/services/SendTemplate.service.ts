import { log } from "console";
import {prisma} from "../prisma";
import { logInfo, logError } from "../utils/logger";
import type { SendTemplatePayload } from "../interface/send.interface";

// Función para enviar mensaje por plantilla
export async function sendTemplateMessage(payload: SendTemplatePayload) {
  const {
    to,
    templateName,
    language,
    parameters = [],
    phoneNumberId,
    accessTokenId,
    actorUserId,
    groupIntegrationId,
  } = payload;

  if (!phoneNumberId || !accessTokenId) {
    throw new Error("phoneNumberId or accessTokenId missing");
  }
  if (!to || !templateName) {
    throw new Error("Missing required fields: to, templateName");
  }

  const languageCode = typeof language === "string" ? language : language?.code;
  if (!languageCode) {
    throw new Error("Language code is missing!");
  }

  // Construir body para la Cloud API de WhatsApp
  const body: any = {
    messaging_product: "whatsapp",
    to,
    type: "template",
    template: {
      name: templateName,
      language: { code: languageCode },
    },
  };

  if (parameters.length > 0) {
    body.template.components = [
      {
        type: "body",
        parameters: parameters.map((p) => ({ type: "text", text: p })),
      },
    ];
  }

  try {
    const res = await fetch(
      `https://graph.facebook.com/v19.0/${phoneNumberId}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessTokenId}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      }
    );

    const data = await res.json();

    if (res.ok) {
      logInfo(`✅ Template message sent: ${JSON.stringify(data)}`);

      
      const giId =
        groupIntegrationId ??
        (
          await prisma.groupIntegration.findFirst({
            where: { phoneNumberId },
            select: { id: true },
          })
        )?.id ??
        null;

      // Previsualización útil para búsquedas rápidas

    } else {
      logError(`❌ Error sending template message: ${JSON.stringify(data)}`);
    }

    return data;
  } catch (error) {
    logError(`❌ Exception sending template message: ${String(error)}`);
    throw error;
  }
}