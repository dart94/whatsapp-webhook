import { Request, Response } from "express";
import { sendTemplateMessage } from "../services/SendTemplate.service";
import { logInfo, logError } from "../utils/logger";
import { sendWhatsAppMessage } from "../services/sendwhatsapp.service";
import { validateToken } from "../services/auth.service";
import { prisma } from "../prisma";
import { log } from "console";
import { renderTemplate } from "../utils/renderTemplate";
import { getUnreadCountsPerConversation } from "../services/messagesby.service";

// Enviar mensajes por plantilla
export const sendTemplate = async (req: Request, res: Response) => {
  const { messages, templateName, language, body } = req.body;

  if (!messages || !templateName || !language || !body) {
    return res.status(400).json({
      success: false,
      message:
        "Missing required fields: messages, templateName, language, body",
    });
  }

  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token)
      return res
        .status(401)
        .json({ success: false, message: "Token required" });

    const decoded = await validateToken(token);
    if (!decoded || typeof decoded !== "object") {
      return res.status(401).json({ success: false, message: "Invalid token" });
    }
    const actorUserId = (decoded as any).id as number;

    const user = await prisma.user.findUnique({
      where: { id: actorUserId },
      select: { groupId: true },
    });
    if (!user?.groupId) {
      return res
        .status(400)
        .json({ success: false, message: "User has no associated group" });
    }

    const integration = await prisma.groupIntegration.findFirst({
      where: { groupId: user.groupId },
      select: { id: true, phoneNumberId: true, accessTokenId: true },
    });
    if (!integration?.phoneNumberId || !integration?.accessTokenId) {
      return res.status(400).json({
        success: false,
        message: "Integration data (phoneNumberId, accessTokenId) missing",
      });
    }

    const {
      id: groupIntegrationId,
      phoneNumberId,
      accessTokenId,
    } = integration;
    const templateBody = body;
    const results: any[] = [];

    for (const msg of messages as Array<{
      to: string;
      parameters?: string[];
    }>) {
      try {
        const renderedBody = renderTemplate(templateBody, msg.parameters || []);

        // Llamada a Meta
        const result = await sendTemplateMessage({
          to: msg.to,
          templateName,
          language,
          parameters: msg.parameters || [],
          phoneNumberId,
          accessTokenId,
          actorUserId,
          groupIntegrationId,
        });

        results.push({ to: msg.to, meta: result });
      } catch (msgError) {
        results.push({ to: msg.to, error: String(msgError) });
        logError(`❌ Error sending template to ${msg.to}: ${msgError}`);
      }
    }

    return res.status(200).json({ success: true, data: results });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error sending template message.",
      error: String(error),
    });
  }
};

//Responder mensajes
export const replyToMessage = async (req: Request, res: Response) => {
  const { to, message, replyToMessageId } = req.body;

  if (!to || !message) {
    return res.status(400).json({
      success: false,
      message: "Missing required fields: to, message",
    });
  }

  try {
    // ✅ Obtener token del header (igual que sendTemplate)
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Token required",
      });
    }

    // ✅ Validar token y obtener usuario
    const decoded = await validateToken(token);
    if (!decoded || typeof decoded !== "object") {
      return res.status(401).json({
        success: false,
        message: "Invalid token",
      });
    }

    const actorUserId = (decoded as any).id as number;

    // ✅ Obtener grupo del usuario
    const user = await prisma.user.findUnique({
      where: { id: actorUserId },
      select: { groupId: true },
    });

    if (!user?.groupId) {
      return res.status(400).json({
        success: false,
        message: "User has no associated group",
      });
    }

    // ✅ Obtener integración con phoneNumberId y accessTokenId
    const integration = await prisma.groupIntegration.findFirst({
      where: { groupId: user.groupId },
      select: { id: true, phoneNumberId: true, accessTokenId: true },
    });

    if (!integration?.phoneNumberId || !integration?.accessTokenId) {
      return res.status(400).json({
        success: false,
        message: "Integration data (phoneNumberId, accessTokenId) missing",
      });
    }

    const { phoneNumberId, accessTokenId } = integration;

    // ✅ Enviar mensaje usando los datos obtenidos de la BD
    const result = await sendWhatsAppMessage({
      to,
      message,
      phoneNumberId,
      accessTokenId,
      replyToMessageId: replyToMessageId || undefined,
      actorUserId,
    });

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
        direction: "IN",
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
      message: "Error al marcar mensajes como leídos",
    });
  }
};

//Contar mensajes sin leer por WAID
export const getUnreadCounts = async (req: Request, res: Response) => {
  try {
    const data = await getUnreadCountsPerConversation();
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error obteniendo conteo de no leídos",
    });
    console.log(error);
  }
};
