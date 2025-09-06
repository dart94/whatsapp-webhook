import { Request, Response } from "express";
import { VERIFY_TOKEN } from "../config/constants";
import { logInfo, logError } from "../utils/logger";
import { processWebhookEvent } from "../services/whatsapp.service";
import { emitEvent } from "./../socket";
import { WhatsAppWebhookBody } from "../interface/whatsapp.interface";

// Función para verificar el webhook de WhatsApp
export const verifyWebhook = (req: Request, res: Response) => {
  const mode = req.query["hub.mode"] as string;
  const token = req.query["hub.verify_token"] as string;
  const challenge = req.query["hub.challenge"] as string;

  if (!mode || !token) {
    logError("Parámetros faltantes");
    return res.sendStatus(400);
  }

  if (mode !== "subscribe" || token !== VERIFY_TOKEN) {
    logError("Token de verificación incorrecto");
    return res.sendStatus(403);
  }

  logInfo("Webhook verificado con Meta!");
  res.status(200).send(challenge);
};

// Función para manejar eventos del webhook
export const handleWebhookEvent = (req: Request, res: Response) => {
  res.sendStatus(200);

  process.nextTick(() => {
    try {
      const body = req.body as WhatsAppWebhookBody;

      logInfo("🚀 Webhook recibido:");
      logInfo(JSON.stringify(body, null, 2));

      processWebhookEvent(body);

      // Buscamos el primer mensaje recibido
      const entry = body.entry?.[0];
      const change = entry?.changes?.[0];
      const message = change?.value?.messages?.[0];

      if (message?.from) {
        emitEvent("new_message", {
          wa_id: message.from,
          body_text: message.text?.body || '',
        });

        logInfo(
          `✅ Evento new_message emitido para wa_id ${message.from}`
        );
      } else {
        logInfo("ℹ️ No se encontró ningún mensaje para emitir vía socket.");
      }
    } catch (error) {
      logError(`🔥 Error al procesar webhook: ${error}`);
    }
  });
};