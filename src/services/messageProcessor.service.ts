import {
  WhatsAppChange,
  WhatsAppMessage,
  WhatsAppStatus,
  WhatsAppContact,
  WhatsAppMetadata
} from '../interface/whatsapp.interface';

import { sendWhatsAppMessage } from './sendWhatsApp.service';
import { generateAutoResponse } from './generateResponse.service';
import { logInfo, logError } from '../utils/logger';

export function processMessageChange(value: WhatsAppChange['value']) {
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

export async function processIncomingMessage(message: WhatsAppMessage) {
  logInfo(`📩 MENSAJE RECIBIDO de ${message.from}: ${message.text?.body}`);

  const responseMessage = generateAutoResponse(message);
  await sendWhatsAppMessage(message.from, responseMessage);

  logInfo(`✅ Respuesta enviada a ${message.from}: "${responseMessage}"`);
}

export function processInteractiveMessage(interactive: WhatsAppMessage['interactive']) {
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

export function processMessageStatus(status: WhatsAppStatus) {
  logInfo(`📊 ESTADO DE MENSAJE: ${status.status} para ${status.recipient_id}`);
  if (status.errors) {
    logError(`Errores: ${JSON.stringify(status.errors)}`);
  }
}

export function processContact(contact: WhatsAppContact) {
  logInfo(`👤 CONTACTO: ${contact.wa_id} - ${contact.profile?.name || 'Sin nombre'}`);
}

export function processMetadata(metadata: WhatsAppMetadata) {
  logInfo(`📋 METADATOS: ${metadata.display_phone_number}`);
}
