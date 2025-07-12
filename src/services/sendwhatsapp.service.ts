import { PHONE_NUMBER_ID, ACCESS_TOKEN } from '../config/constants';
import { logInfo, logError } from '../utils/logger';
import { prisma } from '../prisma';

export async function sendWhatsAppMessage(
  to: string,
  message: string,
  replyToMessageId?: string
) {
  const body: any = {
    messaging_product: 'whatsapp',
    to,
    type: 'text',
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
      `https://graph.facebook.com/v19.0/${PHONE_NUMBER_ID}/messages`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      }
    );

    const data = await response.json();

    if (response.ok) {
      logInfo(`✅ Mensaje enviado: ${JSON.stringify(data)}`);

      // Guardar en DB
      await prisma.whatsappMessage.create({
        data: {
          wa_id: to,
          message_id: data.id,
          direction: 'OUT',
          type: body.type,
          body_text: body.text?.body,
          context_message_id: body.context?.message_id || null,
          timestamp: Number(data.timestamp),
          raw_json: JSON.stringify(data),
        }
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
