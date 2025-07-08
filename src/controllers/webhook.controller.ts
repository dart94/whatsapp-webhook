import { Request, Response } from 'express';
import { VERIFY_TOKEN } from '../config/constants';
import { RequestHandler } from 'express-serve-static-core';
import type { WhatsAppMessage, WhatsAppStatus, WhatsAppContact, WhatsAppMetadata, WhatsAppChange, WhatsAppEntry, WhatsAppWebhookBody } from '../interface/whatsapp.interface';


// Función para verificar el webhook
export const verifyWebhook = (req: Request, res: Response) => {
  const mode = req.query['hub.mode'] as string;
  const token = req.query['hub.verify_token'] as string;
  const challenge = req.query['hub.challenge'] as string;

  if (!mode || !token) {
    console.log("❌ Parámetros faltantes");
    return res.sendStatus(400);
  }

  if (mode !== 'subscribe' || token !== VERIFY_TOKEN) {
    console.log("❌ Token de verificación incorrecto");
    return res.sendStatus(403);
  }

  console.log("✅ Webhook verificado con Meta!");
  res.status(200).send(challenge);
};

// Función para manejar eventos del webhook
export const handleWebhookEvent: RequestHandler = (req, res) => {
  res.sendStatus(200);
  process.nextTick(() => {
  try {
    console.log("🚀 Webhook recibido:");
    console.log("📊 ESTRUCTURA COMPLETA:");
    console.log(JSON.stringify(req.body, null, 2));

    const body = req.body;

    if (body.object === 'whatsapp_business_account') {
      body.entry?.forEach((entry: WhatsAppEntry) => {
        entry.changes?.forEach((change: WhatsAppChange) => {
          if (change.field === 'messages') {
        const messages: WhatsAppMessage[] | undefined = change.value.messages;
        const contacts: WhatsAppContact[] | undefined = change.value.contacts;

        if (messages && contacts) {
          messages.forEach((message: WhatsAppMessage) => {
            const from: string = message.from;
            const text: string | undefined = message.text?.body;

            console.log(`✅ Mensaje recibido de ${from}: ${text}`);

            // Aquí llamás a tu función para responder:
            sendWhatsAppMessage(from, `👋 ¡Hola! Recibí tu mensaje: "${text}"`);
          });
        }
          }
        });
      });
    }
  } catch (error) {
    console.error('🔥 Error al procesar webhook:', error);
  }
});
};

// Funciones auxiliares
function processWhatsAppEvent(body: WhatsAppWebhookBody) {
  body.entry?.forEach((entry: WhatsAppEntry) => {
    entry.changes?.forEach((change: WhatsAppChange) => {
      if (change.field === 'messages') {
        processMessageChange(change.value);
      }
    });
  });
}

function processMessageChange(value: WhatsAppChange['value']) {
  if (value.messages) {
    value.messages.forEach(processIncomingMessage);
  }
  if (value.statuses) {
    value.statuses.forEach(processMessageStatus);
  }
  if (value.contacts) {
    value.contacts.forEach(processContact);
  }
  if (value.metadata) {
    processMetadata(value.metadata);
  }
}

const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID as string; // El ID de tu número de teléfono
const ACCESS_TOKEN = process.env.ACCESS_TOKEN as string; // Tu token de acceso

// Función para enviar mensajes a WhatsApp
async function sendWhatsAppMessage(to: string, message: string) {
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
      })
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Mensaje enviado exitosamente:', data);
    } else {
      console.error('❌ Error en la respuesta de Meta:', data);
    }
    
    return data;
  } catch (error) {
    console.error('❌ Error enviando mensaje:', error);
    throw error;
  }
}

// Función para generar respuestas automáticas
function generateAutoResponse(message: WhatsAppMessage): string {
  switch (message.type) {
    case 'text':
      const userText = message.text?.body?.toLowerCase() || '';
      
      // Respuestas simples basadas en el texto
      if (userText.includes('hola')) {
        return '¡Hola! 👋 ¿Cómo puedo ayudarte?';
      }
      if (userText.includes('gracias')) {
        return '¡De nada! 😊 ¿Hay algo más en lo que pueda ayudarte?';
      }
      if (userText.includes('adiós') || userText.includes('bye')) {
        return '¡Hasta luego! 👋 Que tengas un buen día.';
      }
      
      // Respuesta por defecto
      return `Recibí tu mensaje: "${message.text?.body}". ¿En qué puedo ayudarte?`;
      
    case 'image':
      return '📸 ¡Bonita imagen! Gracias por compartirla.';
      
    case 'document':
      return '📄 Documento recibido. Lo revisaré pronto.';
      
    case 'audio':
      return '🎵 Audio recibido. Lo escucharé en un momento.';
      
    case 'video':
      return '🎥 Video recibido. Lo veré pronto.';
      
    case 'location':
      return '📍 Ubicación recibida. ¡Gracias por compartirla!';
      
    default:
      return 'Mensaje recibido. ¿En qué puedo ayudarte?';
  }
}

// Función modificada para procesar mensajes entrantes
async function processIncomingMessage(message: WhatsAppMessage) {
  console.log("\n📩 MENSAJE RECIBIDO:");
  console.log(`De: ${message.from}`);
  console.log(`ID: ${message.id}`);
  console.log(`Timestamp: ${message.timestamp}`);
  console.log(`Tipo: ${message.type}`);
  
  switch (message.type) {
    case 'text':
      console.log(`Texto: ${message.text?.body}`);
      break;
    case 'image':
      console.log(`Imagen ID: ${message.image?.id}`);
      console.log(`Caption: ${message.image?.caption || 'Sin caption'}`);
      break;
    case 'document':
      console.log(`Documento: ${message.document?.filename}`);
      break;
    case 'audio':
      console.log(`Audio ID: ${message.audio?.id}`);
      break;
    case 'video':
      console.log(`Video ID: ${message.video?.id}`);
      break;
    case 'location':
      console.log(`Ubicación: ${message.location?.latitude}, ${message.location?.longitude}`);
      break;
    case 'contacts':
      console.log(`Contacto: ${message.contacts?.[0]?.name?.formatted_name}`);
      break;
    case 'interactive':
      processInteractiveMessage(message.interactive);
      break;
    default:
      console.log(`Tipo de mensaje no manejado: ${message.type}`);
  }
  
  if (message.context) {
    console.log("\n🔄 ESTE ES UN REPLY/RESPUESTA:");
    console.log(`En respuesta al mensaje ID: ${message.context.id}`);
    if (message.context.from) {
      console.log(`Mensaje original de: ${message.context.from}`);
    }
  }
  
  // 🚀 AQUÍ ES DONDE ENVÍAS LA RESPUESTA
  try {
    console.log("\n📤 ENVIANDO RESPUESTA...");
    
    // Generar respuesta automática
    const responseMessage = generateAutoResponse(message);
    
    // Enviar respuesta a WhatsApp
    await sendWhatsAppMessage(message.from, responseMessage);
    
    console.log(`✅ Respuesta enviada a ${message.from}: "${responseMessage}"`);
    
  } catch (error) {
    console.error('❌ Error enviando respuesta:', error);
  }
  
  console.log("---");
}

// Función para enviar mensajes con diferentes tipos
async function sendAdvancedMessage(to: string, type: 'text' | 'image' | 'document', content: any) {
  const basePayload = {
    messaging_product: 'whatsapp',
    to: to,
  };

  let payload;
  
  switch (type) {
    case 'text':
      payload = {
        ...basePayload,
        text: { body: content }
      };
      break;
      
    case 'image':
      payload = {
        ...basePayload,
        image: {
          link: content.url,
          caption: content.caption || ''
        }
      };
      break;
      
    case 'document':
      payload = {
        ...basePayload,
        document: {
          link: content.url,
          filename: content.filename || 'documento.pdf'
        }
      };
      break;
  }

  try {
    const response = await fetch(`https://graph.facebook.com/v18.0/${PHONE_NUMBER_ID}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    console.log('✅ Mensaje avanzado enviado:', data);
    return data;
  } catch (error) {
    console.error('❌ Error enviando mensaje avanzado:', error);
    throw error;
  }
}

function processInteractiveMessage(interactive: WhatsAppMessage['interactive']) {
  if (!interactive) return;

  console.log(`Interactivo: ${interactive.type}`);
  if (interactive.button_reply) {
    console.log(`Botón presionado: ${interactive.button_reply.title}`);
    console.log(`ID del botón: ${interactive.button_reply.id}`);
  }
  if (interactive.list_reply) {
    console.log(`Lista seleccionada: ${interactive.list_reply.title}`);
    console.log(`ID de la lista: ${interactive.list_reply.id}`);
  }
}

function processMessageStatus(status: WhatsAppStatus) {
  console.log("\n📊 ESTADO DE MENSAJE:");
  console.log(`ID del mensaje: ${status.id}`);
  console.log(`Para: ${status.recipient_id}`);
  console.log(`Estado: ${status.status}`);
  console.log(`Timestamp: ${status.timestamp}`);

  if (status.errors) {
    console.log(`❌ Errores: ${JSON.stringify(status.errors)}`);
  }
  console.log("---");
}

function processContact(contact: WhatsAppContact) {
  console.log("\n👤 CONTACTO:");
  console.log(`WhatsApp ID: ${contact.wa_id}`);
  console.log(`Nombre: ${contact.profile?.name || 'Sin nombre'}`);
  console.log("---");
}

function processMetadata(metadata: WhatsAppMetadata) {
  console.log("\n📋 METADATOS:");
  console.log(`Número de teléfono: ${metadata.phone_number_id}`);
  console.log(`Display name: ${metadata.display_phone_number}`);
  console.log("---");
}