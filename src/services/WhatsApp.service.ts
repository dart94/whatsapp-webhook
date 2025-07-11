import {
  WhatsAppWebhookBody,
  WhatsAppEntry,
  WhatsAppChange,
} from "../interface/whatsapp.interface";
import { processMessageChange } from "./messageProcessor.service";

// Función para procesar el webhook de WhatsApp y realizar acciones en función de los cambios
export function processWebhookEvent(body: WhatsAppWebhookBody) {
  if (body.object === "whatsapp_business_account") {
    body.entry?.forEach((entry: WhatsAppEntry) => {
      entry.changes?.forEach((change: WhatsAppChange) => {
        if (change.field === "messages") {
          processMessageChange(change.value);
        }
      });
    });
  }
}
