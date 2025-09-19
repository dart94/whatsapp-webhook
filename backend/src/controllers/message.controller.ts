import { Request, Response } from "express";
import { sendTemplateMessage } from "../services/SendTemplate.service";
import { logInfo, logError } from "../utils/logger";
import { sendWhatsAppMessage } from "../services/sendwhatsapp.service";
import { validateToken } from "../services/auth.service";
import { prisma } from "../prisma";
import { log } from "console";
import { renderTemplate } from "../utils/renderTemplate";
import { getUnreadCountsPerConversation } from "../services/messagesby.service";

type IncomingMessage = {
  to: string;
  parameters?: string[];
};

// Enviar mensajes por plantilla (paralelo con Promise.allSettled)
export const sendTemplate = async (req: Request, res: Response) => {
  const { messages, templateName, language, body, campaignName: campaignNameFromBody } = req.body as {
    messages: IncomingMessage[];
    templateName: string;
    language: string;
    body: string;
    campaignName?: string;
  };

  // Validación de payload
  if (!Array.isArray(messages) || messages.length === 0 || !templateName || !language || !body) {
    return res.status(400).json({
      success: false,
      message: "Missing or invalid fields: messages, templateName, language, body",
    });
  }

  try {
    // Token (Bearer xxx)
    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : authHeader || undefined;
    if (!token) {
      return res.status(401).json({ success: false, message: "Token required" });
    }

    const decoded = await validateToken(token);
    if (!decoded || typeof decoded !== "object" || !("id" in decoded)) {
      return res.status(401).json({ success: false, message: "Invalid token" });
    }
    const actorUserId = (decoded as any).id as number;

    // Usuario y grupo
    const user = await prisma.user.findUnique({
      where: { id: actorUserId },
      select: { groupId: true },
    });
    if (!user?.groupId) {
      return res.status(400).json({ success: false, message: "User has no associated group" });
    }

    // Integración por grupo
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
    const campaignName = campaignNameFromBody ?? templateName;

    // Helper de éxito
    const isResultSuccess = (result: any) => {
      if (!result) return false;

      // axios/fetch-like ok
      if (typeof result.ok === "boolean" && result.ok) return true;

      // axios status 2xx
      if (typeof result.status === "number" && result.status >= 200 && result.status < 300) return true;

      // estructura Meta
      const msgs = result?.messages;
      if (Array.isArray(msgs) && msgs.length > 0) {
        const first = msgs[0];
        if (first?.id) return true;
        const status = (first?.message_status || first?.status || "").toString().toLowerCase();
        const accepted = new Set(["accepted", "queued", "sent", "delivered", "scheduled"]);
        if (status && accepted.has(status)) return true;
      }

      // presencia de errors => fallo
      if (result?.errors) return false;

      return false;
    };

    // Ejecutar envíos en paralelo
    const tasks = messages.map(async (msg) => {
      const params = Array.isArray(msg.parameters) ? msg.parameters : [];
      const renderedBody = renderTemplate(templateBody, params);

      try {
        const result = await sendTemplateMessage({
          to: msg.to,
          templateName,
          language,
          parameters: params,
          phoneNumberId,
          accessTokenId,
          actorUserId,
          groupIntegrationId,
        });

        const message_id: string = result?.messages?.[0]?.id ?? "NO_ID";
        const success = isResultSuccess(result);
        const status = success ? "SENT" : "FAILED";

        await prisma.whatsappMessage.create({
          data: {
            wa_id: msg.to,
            message_id,
            direction: "OUT",
            type: "template",
            body_text: renderedBody,
            context_message_id: null,
            timestamp: BigInt(Math.floor(Date.now() / 1000)),
            raw_json: result,
            read: false,
            fromPhone: phoneNumberId,
            toPhone: msg.to,
            sentByUserId: actorUserId,
            groupIntegrationId,
            status,
            campaignName,
          },
        });

        return { to: msg.to, success, meta: result };
      } catch (err: any) {
        logError(`❌ Error sending template to ${msg.to}: ${err?.message || String(err)}`);

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
              raw_json: JSON.stringify({ error: err?.message || String(err) }),
              read: false,
              fromPhone: phoneNumberId,
              toPhone: msg.to,
              sentByUserId: actorUserId,
              groupIntegrationId,
              status: "FAILED",
              campaignName,
            },
          });
        } catch (dbErr: any) {
          logError(`❌ Error saving failed message for ${msg.to}: ${dbErr?.message || String(dbErr)}`);
        }

        return { to: msg.to, success: false, error: err?.message || String(err) };
      }
    });

    const settled = await Promise.allSettled(tasks);
    const results = settled.map((s) => (s.status === "fulfilled" ? s.value : { success: false, error: String(s.reason) }));

    const total = results.length;
    const sent = results.filter((r: any) => r.success).length;
    const failed = total - sent;

    return res.status(200).json({
      success: true,
      total,
      sent,
      failed,
      data: results,
    });
  } catch (error: any) {
    logError(`❌ sendTemplate controller error: ${error?.message || String(error)}`);
    return res.status(500).json({
      success: false,
      message: "Error sending template message.",
      error: error?.message || String(error),
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
      logInfo: `✅ Respuesta enviada a ${message.from}: "${result.messages[0].body}"`
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