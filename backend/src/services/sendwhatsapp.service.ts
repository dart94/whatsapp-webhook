import { logInfo, logError } from "../utils/logger";
import { prisma } from "../prisma";
import type { SendTextPayload } from "../interface/send.interface";

// Función para enviar un mensaje de texto dinámico
export async function sendWhatsAppMessage(payload: SendTextPayload) {
  const {
    to,
    message,
    phoneNumberId,
    accessTokenId,
    replyToMessageId,
    actorUserId,
  } = payload;



  const body: any = {
    messaging_product: "whatsapp",
    to,
    type: "text",
    text: {
      body: message,
    },
  };

  if (replyToMessageId) {
    body.context = {
      message_id: replyToMessageId,
    };
  }

  try {
    const response = await fetch(
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

    const data = await response.json();

    if (response.ok) {
      logInfo(`✅ Mensaje enviado: ${JSON.stringify(data)}`);

      const gi = await prisma.groupIntegration.findFirst({
        where: { phoneNumberId },
        select: { id: true },
      });

      // Guardar en DB
      await prisma.whatsappMessage.create({
        data: {
          wa_id: to,
          message_id: data.messages?.[0]?.id || "unknown",
          direction: "OUT",
          type: "text",
          body_text: message,
          context_message_id: replyToMessageId || null,
          timestamp: BigInt(Math.floor(Date.now() / 1000)),
          raw_json: data,
          read: true,

          fromPhone: phoneNumberId, 
          toPhone: to,
          groupIntegrationId: gi?.id ?? null,
          sentByUserId: actorUserId,
        },
      });
    } else {
      logError(`❌ Error en la respuesta de Meta: ${JSON.stringify(data)}`);
    }

    return data;
  } catch (error) {
    logError(`❌ Error enviando mensaje: ${error}`);
    throw error;
  }
}
