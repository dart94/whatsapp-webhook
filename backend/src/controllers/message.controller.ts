import { Request, Response } from "express";
import { sendTemplateMessage } from "../services/SendTemplate.service";
import { logInfo, logError } from "../utils/logger";
import { sendWhatsAppMessage } from "../services/sendwhatsapp.service";
import { prisma } from "../prisma";
import { log } from "console";
import { renderTemplate } from "../utils/renderTemplate";

//Enviar mensajes por plantilla
export const sendTemplate = async (req: Request, res: Response) => {
  const { messages, templateName, language, body } = req.body;

  if (!messages || !templateName || !language || !body) {
    return res.status(400).json({
      success: false,
      message: "Missing required fields: messages, templateName, language, body",
    });
  }

  try {
    const templateBody = body;
    const results = [];

    for (const msg of messages) {
      // ✅ Renderizar body
      const renderedBody = renderTemplate(templateBody, msg.parameters || []);

      // ✅ Enviar a Meta
      const result = await sendTemplateMessage(
        msg.to,
        templateName,
        language,
        msg.parameters || []
      );

      const message_id = result?.messages?.[0]?.id || "";

      // ✅ Guardar en WhatsAppMessage
      await prisma.whatsappMessage.create({
        data: {
          wa_id: msg.to,
          message_id,
          direction: "OUT",
          type: "template",
          body_text: renderedBody,
          context_message_id: null,
          timestamp: BigInt(Math.floor(Date.now() / 1000)),
          raw_json: JSON.stringify(result),
          read: false,
          
        },
      });
      console.log("✅ WhatsAppMessage guardado");

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
  const { to, message } = req.body;

  if (!to || !message  ) {
    return res.status(400).json({
      success: false,
      message: "Missing required fields: to, message",
    });
  }

  try {
    const result = await sendWhatsAppMessage(to, message );

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
  try {
    const messages = await prisma.whatsappMessage.findMany({
      orderBy: { createdAt: "asc" },
      take: 20,
    });

    const fixedMessages = messages.map((msg) => ({
      ...msg,
      id: Number(msg.id),
      timestamp: msg.timestamp ? Number(msg.timestamp) : null,
    }));
    logInfo(`✅ Mensajes recientes obtenidos: ${fixedMessages.length}`);

    res.json({
      success: true,
      data: fixedMessages,
    });
  } catch (error) {
    logError(`❌ Error al obtener mensajes recientes: ${error}`);
    return res.status(500).json({
      success: false,
      message: "Error getting recent messages.",
    });
  }
};


//Marcar mensaje como leído
export const markMessagesAsRead = async (req: Request, res: Response) => {
  const waId = req.params.waId;

  try {
    const result = await prisma.whatsappMessage.updateMany({
      where: {
        wa_id: waId,
        direction: 'IN',
        read: false,
      },
      data: {
        read: true,
      },
    });

    logInfo(`✅ Mensajes marcados como leídos para ${waId}: ${result.count}`);

    return res.json({
      success: true,
      updatedCount: result.count,
    });
  } catch (error) {
    logError(`❌ Error marcando mensajes como leídos: ${error}`);
    return res.status(500).json({
      success: false,
      message: 'Error al marcar mensajes como leídos',
    });
  }
};