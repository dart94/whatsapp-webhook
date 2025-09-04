import { Request, Response } from "express";
import { sendTemplateMessage } from "../services/SendTemplate.service";
import { logInfo, logError } from "../utils/logger";
import { sendWhatsAppMessage } from "../services/sendwhatsapp.service";
import { validateToken } from "../services/auth.service";
import { prisma } from "../prisma";
import { log } from "console";
import { renderTemplate } from "../utils/renderTemplate";
import { getUnreadCountsPerConversation } from "../services/messagesby.service";

// Enviar mensajes por plantilla (paralelo con Promise.allSettled)
export const sendTemplate = async (req: Request, res: Response) => {
  const { messages, templateName, language, body } = req.body;

  if (!Array.isArray(messages) || messages.length === 0 || !templateName || !language || !body) {
    return res.status(400).json({
      success: false,
      message: "Missing or invalid fields: messages, templateName, language, body",
    });
  }

  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ success: false, message: "Token required" });

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
      return res.status(400).json({ success: false, message: "User has no associated group" });
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

    const { id: groupIntegrationId, phoneNumberId, accessTokenId } = integration;
    const templateBody = body;

    // Helper: decide si la respuesta indica éxito
    const isResultSuccess = (result: any) => {
      if (!result) return false;

      // Si el wrapper trae `ok` (fetch/axios) y es booleano
      if (typeof result.ok === "boolean") {
        if (result.ok) return true;
      }

      // Chequear array messages
      const msgs = result?.messages;
      if (Array.isArray(msgs) && msgs.length > 0) {
        const first = msgs[0];
        // Si existe id => éxito
        if (first?.id) return true;

        // O si message_status es alguno aceptado por Meta
        const status = (first?.message_status || first?.status || "").toString().toLowerCase();
        const accepted = new Set(["accepted", "queued", "sent", "delivered", "scheduled"]);
        if (status && accepted.has(status)) return true;
      }

      // Si hay un campo errors explícito => fallo
      if (result?.errors) return false;

      // Caso por defecto: fallo
      return false;
    };

    // Mapear mensajes a promesas (envío + guardado BD)
    const tasks = (messages as Array<{ to: string; parameters?: string[] }>).map(async (msg) => {
      const renderedBody = renderTemplate(templateBody, msg.parameters || []);
      try {
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

        // Extraer id y status
        const message_id = result?.messages?.[0]?.id ?? "NO_ID";
        const success = isResultSuccess(result);
        const status = success ? "SENT" : "FAILED";

        // Guardar en BD. Ajusta raw_json según tu schema: si es Json, guárdalo directamente; si es String, stringify.
        await prisma.whatsappMessage.create({
          data: {
            wa_id: msg.to,
            message_id,
            direction: "OUT",
            type: "template",
            body_text: renderedBody,
            context_message_id: null,
            timestamp: BigInt(Math.floor(Date.now() / 1000)),
            raw_json: typeof result === "string" ? result : JSON.stringify(result),
            read: false,
            fromPhone: phoneNumberId,
            toPhone: msg.to,
            sentByUserId: actorUserId,
            groupIntegrationId,
            status,
          },
        });

        return { to: msg.to, success, meta: result };
      } catch (err) {
        logError(`❌ Error sending template to ${msg.to}: ${err}`);

        // Guardar intento fallido en BD también
        try {
          await prisma.whatsappMessage.create({
            data: {
              wa_id: msg.to,
              message_id: "NO_ID",
              direction: "OUT",
              type: "template",
              body_text: renderedBody,
              context_message_id: null,
              timestamp: BigInt(Math.floor(Date.now() / 1000)),
              raw_json: JSON.stringify({
                error: String(err),
              }),
              read: false,
              fromPhone: phoneNumberId,
              toPhone: msg.to,
              sentByUserId: actorUserId,
              groupIntegrationId,
              status: "FAILED",
            },
          });
        } catch (dbErr) {
          logError(`❌ Error saving failed message for ${msg.to}: ${dbErr}`);
        }

        return { to: msg.to, success: false, error: String(err) };
      }
    });

    // Ejecutar en paralelo y esperar resultados
    const settled = await Promise.allSettled(tasks);
    const results = settled.map(s => (s.status === "fulfilled" ? s.value : { error: String((s as any).reason) }));

    const total = results.length;
    const sent = results.filter(r => (r as any).success).length;
    const failed = total - sent;

    return res.status(200).json({
      success: true,
      total,
      sent,
      failed,
      data: results,
    });
  } catch (error) {
    logError(`❌ sendTemplate controller error: ${error}`);
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
        message: "Token required" 
      });
    }

    // ✅ Validar token y obtener usuario
    const decoded = await validateToken(token);
    if (!decoded || typeof decoded !== "object") {
      return res.status(401).json({ 
        success: false, 
        message: "Invalid token" 
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
        message: "User has no associated group" 
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

//Contar mensajes sin leer por WAID
export const getUnreadCounts = async (req: Request, res: Response) => {
  try {
    const data = await getUnreadCountsPerConversation();
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error obteniendo conteo de no leídos',
    });
    console.log(error);
  }
};