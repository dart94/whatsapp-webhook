import { PHONE_NUMBER_ID, ACCESS_TOKEN } from '../config/constants';
import { logInfo, logError } from '../utils/logger';
import { prisma } from '../prisma';

// types
interface SendTextPayload {
  to: string;
  message: string;
  phoneNumberId: string; // ahora dinámico
  accessTokenId: string; // ahora dinámico
  replyToMessageId?: string;
}

// Función para enviar un mensaje de texto dinámico
export async function sendWhatsAppMessage(payload: SendTextPayload) {
  const { to, message, phoneNumberId, accessTokenId, replyToMessageId } = payload;

  if (!phoneNumberId || !accessTokenId) {
    throw new Error("phoneNumberId or accessTokenId missing");
  }

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
      `https://graph.facebook.com/v19.0/${phoneNumberId}/messages`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessTokenId}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      }
    );
    console.log("Número destino:", to);

    const data = await response.json();

    if (response.ok) {
      logInfo(`✅ Mensaje enviado: ${JSON.stringify(data)}`);

      // Guardar en DB
      await prisma.whatsappMessage.create({
        data: {
          wa_id: to,
          message_id: data.messages?.[0]?.id || 'unknown',
          direction: 'OUT',
          type: 'text',
          body_text: message,
          context_message_id: replyToMessageId || null,
          timestamp: BigInt(Math.floor(Date.now() / 1000)),
          raw_json: JSON.stringify(data),
          read: true,
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
