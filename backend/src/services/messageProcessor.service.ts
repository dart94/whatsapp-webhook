import {
  WhatsAppChange,
  WhatsAppMessage,
  WhatsAppStatus,
  WhatsAppContact,
  WhatsAppMetadata,
} from "../interface/whatsapp.interface";
import { sendWhatsAppMessage } from "./sendwhatsapp.service";
import { generateAutoResponse } from "./generateResponse.service";
import { logInfo, logError } from "../utils/logger";
import { prisma } from "../prisma";


// Función para procesar los cambios en un mensaje
export function processMessageChange(value: WhatsAppChange["value"]) {
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


// Función para procesar mensajes entrantes
export async function processIncomingMessage(message: WhatsAppMessage) {
  logInfo(`📩 MENSAJE RECIBIDO de ${message.from}: ${message.text?.body}`);

    // Guardar en DB
  await prisma.whatsappMessage.create({
    data: {
      wa_id: message.from,
      message_id: message.id,
      direction: 'IN',
      type: message.type,
      body_text: message.text?.body,
      context_message_id: message.context?.id || null,
      timestamp: Number(message.timestamp),
      raw_json: JSON.stringify(message),
      read: false,
      fromPhone: message.from,
      toPhone: message.from,
      groupIntegrationId: null,
      sentByUserId: null,
      status: "SENT",
    }
  });

  logInfo(`✅ Mensaje guardado en la base de datos.`);

  // Respuesta automática para mensajes entrantes
  const AUTO_RESPONSE_ENABLED = false;

  if (AUTO_RESPONSE_ENABLED) {
    const responseMessage = generateAutoResponse(message);
    await sendWhatsAppMessage({
      to: message.from,
      message: responseMessage,
      phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID || "",
      accessTokenId: process.env.WHATSAPP_ACCESS_TOKEN || "",
      replyToMessageId: message.id,
    });

    logInfo(`✅ Respuesta enviada a ${message.from}: "${responseMessage}"`);
  } else {
    logInfo("⚠️ Auto-respuesta desactivada. Mensaje solo registrado.");
  }
}

// Función para procesar mensajes interactivos (botones, listas)
export function processInteractiveMessage(
  interactive: WhatsAppMessage["interactive"]
) {
  if (!interactive) return;

  logInfo(`Interactivo: ${interactive.type}`);
  if (interactive.button_reply) {
    logInfo(`Botón presionado: ${interactive.button_reply.title}`);
    logInfo(`ID del botón: ${interactive.button_reply.id}`);
  }
  if (interactive.list_reply) {
    logInfo(`Lista seleccionada: ${interactive.list_reply.title}`);
    logInfo(`ID de la lista: ${interactive.list_reply.id}`);
  }
}

// Función para procesar el estado de un mensaje
export function processMessageStatus(status: WhatsAppStatus) {
  logInfo(`📊 ESTADO DE MENSAJE: ${status.status} para ${status.recipient_id}`);
  if (status.errors) {
    logError(`Errores: ${JSON.stringify(status.errors)}`);
  }
}

// Función para procesar contactos
export function processContact(contact: WhatsAppContact) {
  logInfo(
    `👤 CONTACTO: ${contact.wa_id} - ${contact.profile?.name || "Sin nombre"}`
  );
}

// Función para procesar metadatos
export function processMetadata(metadata: WhatsAppMetadata) {
  logInfo(`📋 METADATOS: ${metadata.display_phone_number}`);
}
