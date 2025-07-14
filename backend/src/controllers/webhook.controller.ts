import { Request, Response } from "express";
import { VERIFY_TOKEN } from "../config/constants";
import { logInfo, logError } from "../utils/logger";
import { processWebhookEvent } from "../services/whatsapp.service";
import { emitEvent } from "./../socket";

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
      logInfo("🚀 Webhook recibido:");
      logInfo(JSON.stringify(req.body, null, 2));

      processWebhookEvent(req.body);

      emitEvent("new_message", { message: "hay un nuevo mensaje" });
    } catch (error) {
      logError(`🔥 Error al procesar webhook: ${error}`);
    }
  });
};
