import { PHONE_NUMBER_ID, ACCESS_TOKEN } from '../config/constants';
import { logInfo, logError } from '../utils/logger';

export async function sendWhatsAppMessage(to: string, message: string) {
  try {
    const response = await fetch(`https://graph.facebook.com/v18.0/${PHONE_NUMBER_ID}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: to,
        text: { body: message }
      }),
    });

    const data = await response.json();

    if (response.ok) {
      logInfo(`Mensaje enviado exitosamente: ${JSON.stringify(data)}`);
    } else {
      logError(`Error en la respuesta de Meta: ${JSON.stringify(data)}`);
    }

    return data;
  } catch (error) {
    logError(`Error enviando mensaje: ${error}`);
    throw error;
  }
}
