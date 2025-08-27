import { Request, Response } from "express";
import { getWhatsAppTemplates } from "../services/template.service";
import { logError } from "../utils/logger";
import { WhatsAppTemplate, WhatsAppButton } from "../interface/whatsapp.interface";

// Obtener plantillas de WhatsApp
export const getTemplates = async (req: Request, res: Response) => {
  try {
    // 🔹 Leer token dinámico del header
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "❌ Token no proporcionado",
      });
    }

    // 🔹 Pasamos token dinámico
    const templates = await getWhatsAppTemplates(token);

    const mappedTemplates: WhatsAppTemplate[] = templates.map((t: any) => ({
      id: t.id,
      name: t.name,
      language: t.language,
      status: t.status,
      category: t.category,
      header: t.components?.find((c: any) => c.type === "HEADER")?.text || null,
      body: t.components?.find((c: any) => c.type === "BODY")?.text || null,
      footer: t.components?.find((c: any) => c.type === "FOOTER")?.text || null,
      buttons:
        t.components
          ?.find((c: any) => c.type === "BUTTON")
          ?.buttons?.map((b: WhatsAppButton) => ({
            type: b.type,
            text: b.text,
          })) || [],
    }));

    res.status(200).json({
      success: true,
      data: mappedTemplates,
    });
  } catch (error) {
    logError(`❌ Error en getTemplates: ${error}`);
    res.status(500).json({
      success: false,
      message: "Error al obtener plantillas de WhatsApp.",
    });
  }
};
