import { Request, Response } from "express";
import { sendTemplateMessage } from "../services/SendTemplate.service";
import { logInfo, logError } from "../utils/logger";
import { sendWhatsAppMessage } from "../services/sendwhatsapp.service";
import { prisma } from "../prisma";
import { log } from "console";
import { renderTemplate } from "../utils/renderTemplate";
import { getUnreadCountsPerConversation } from "../services/messagesby.service";

//Enviar mensajes por plantilla
export const sendTemplate = async (req: Request, res: Response) => {
  const { messages, templateName, language, body } = req.body;

  // ✅ Validación de campos requeridos
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
      try {
        console.log("----------------------------------------------------");
        console.log(`📤 Enviando plantilla: ${templateName}`);
        console.log(`➡️ Destinatario: ${msg.to}`);
        console.log(`🌐 Idioma: ${language}`);
        console.log(`📄 Parámetros recibidos:`, msg.parameters || []);

        // ✅ Renderizar body
        const renderedBody = renderTemplate(templateBody, msg.parameters || []);
        console.log(`📝 Body renderizado: ${renderedBody}`);

        // ✅ Enviar a Meta
        const result = await sendTemplateMessage(
          msg.to,
          templateName,
          language,
          msg.parameters || []
        );
        console.log(`📡 Respuesta de Meta:`, JSON.stringify(result, null, 2));

        // Verificar si la API devolvió mensajes
        if (!result?.messages || result.messages.length === 0) {
          console.warn(`⚠️ No se recibió message_id para ${msg.to}`);
        }

        const message_id = result?.messages?.[0]?.id || "NO_ID";

        // ✅ Guardar en BD
        const saved = await prisma.whatsappMessage.create({
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
        console.log(`💾 Guardado en BD con ID interno: ${saved.id}`);

        results.push({
          to: msg.to,
          result,
        });

      } catch (msgError) {
        console.error(`❌ Error procesando ${msg.to}:`, msgError);
        results.push({
          to: msg.to,
          error: String(msgError),
        });
      }
    }

    console.log("✅ Proceso completado para todas las plantillas");
    return res.status(200).json({
      success: true,
      data: results,
    });

  } catch (error) {
    console.error(`❌ Error general en sendTemplate:`, error);
    return res.status(500).json({
      success: false,
      message: "Error sending template message.",
      error: String(error),
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