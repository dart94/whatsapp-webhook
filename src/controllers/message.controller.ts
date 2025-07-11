import { Request, Response } from "express";
import { sendTemplateMessage } from "../services/SendTemplate.service";
import { logInfo, logError } from "../utils/logger";
import { sendWhatsAppMessage } from "../services/sendwhatsapp.service";
import { prisma } from "../prisma";

//Enviar mensajes por plantilla
export const sendTemplate = async (req: Request, res: Response) => {
  const { messages, templateName, language } = req.body;

  if (!messages || !templateName || !language) {
    return res.status(400).json({
      success: false,
      message: "Missing required fields: messages, templateName, language",
    });
  }

  try {
    const results = [];

    for (const msg of messages) {
      const result = await sendTemplateMessage(
        msg.to,
        templateName,
        language,
        msg.parameters || []
      );

      results.push({
        to: msg.to,
        result,
      });
    }

    return res.status(200).json({
      success: true,
      data: results,
    });
  } catch (error) {
    logError(`❌ Error in sendTemplate controller: ${error}`);
    return res.status(500).json({
      success: false,
      message: "Error sending template message.",
    });
  }
};

//Responder mensajes
export const replyToMessage = async (req: Request, res: Response) => {
  const { to, message, replyToMessageId } = req.body;

  if (!to || !message || !replyToMessageId) {
    return res.status(400).json({
      success: false,
      message: "Missing required fields: to, message, replyToMessageId",
    });
  }

  try {
    const result = await sendWhatsAppMessage(to, message, replyToMessageId);

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    logError(`❌ Error in replyToMessage controller: ${error}`);
    return res.status(500).json({
      success: false,
      message: "Error sending reply message.",
    });
  }
};


//Obtener mensajes recientes
export const getRecentMessages = async (req: Request, res: Response) => {
  const messages = await prisma.whatsappMessage.findMany({
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  res.json({
    success: true,
    data: messages,
  });
};
