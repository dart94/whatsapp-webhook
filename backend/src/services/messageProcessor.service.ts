

// Función para procesar los cambios en un mensaje
import { prisma } from "../prisma";
import { logInfo, logError } from "../utils/logger";
import { WhatsAppWebhookBody, WhatsAppChange, WhatsAppMessage } from "../interface/whatsapp.interface";

// NUEVO: enruta correctamente cada cambio del webhook
export async function processWebhookEvent(body: WhatsAppWebhookBody) {
  for (const entry of body.entry ?? []) {
    for (const change of entry.changes ?? []) {
      await processMessageChange(change.value);
    }
  }
}

// Procesa los “value” de cada change
export async function processMessageChange(value: WhatsAppChange["value"]) {
  try {
    if (value.messages && value.messages.length) {
      for (const msg of value.messages) {
        await processIncomingMessage(msg, value);
      }
    }

  } catch (e) {
    logError(`processMessageChange error: ${e}`);
  }
}

// Procesa mensajes entrantes (ROBUSTO a tipos)
export async function processIncomingMessage(message: WhatsAppMessage, value?: WhatsAppChange["value"]) {
  const businessPhone = value?.metadata?.display_phone_number || value?.metadata?.phone_number_id || null;

  // Normaliza el cuerpo para distintos tipos
  const type = message.type;
  const bodyText =
    type === "text"        ? (message.text?.body ?? "")
  : type === "interactive" ? (message.interactive?.button_reply?.title
                           || message.interactive?.list_reply?.title
                           || "")
  : type === "image"       ? "[image]"
  : type === "document"    ? "[document]"
  : type === "audio"       ? "[audio]"
  : type === "video"       ? "[video]"
  :                         `[${type ?? "unknown"}]`;

  logInfo(`📩 MENSAJE RECIBIDO de ${message.from}: ${bodyText}`);

  // Persistencia INBOUND con idempotencia por message_id
  try {
    await prisma.whatsappMessage.create({
      data: {
        wa_id: message.from,
        message_id: message.id,            // <— pon UNIQUE en DB
        direction: "IN",
        type,
        body_text: bodyText,               // evita undefined
        context_message_id: message.context?.id ?? null,
        timestamp: Number(message.timestamp ?? Date.now() / 1000),
        raw_json: JSON.stringify(message),
        read: false,
        fromPhone: message.from,
        toPhone: businessPhone,            // <— esto antes lo ponías = from
        groupIntegrationId: null,
        sentByUserId: null,
        status: "RECEIVED",                // <— INBOUND, no "SENT"
      },
    });
    logInfo(`✅ Mensaje ${message.id} guardado en la base de datos.`);
  } catch (err: any) {
    // Prisma: duplicado por UNIQUE(message_id)
    if (err?.code === "P2002") {
      logInfo(`↩️ Duplicado ignorado (message_id ${message.id}).`);
    } else {
      logError(`💥 Error guardando mensaje ${message.id}: ${err}`);
      throw err;
    }
  }

  // (Opcional) Auto-respuesta…
  const AUTO_RESPONSE_ENABLED = false;
  if (AUTO_RESPONSE_ENABLED) {
    // ...
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


