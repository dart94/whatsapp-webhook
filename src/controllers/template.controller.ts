import { Request, Response } from "express";
import { getWhatsAppTemplates } from "../services/template.service";
import { logInfo, logError } from "../utils/logger";

export const getTemplates = async (req: Request, res: Response) => {
  try {
    const templates = await getWhatsAppTemplates();

    const mappedTemplates = templates.map((t: any) => ({
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
          ?.find((c: any) => c.type === "BUTTONS")
          ?.buttons?.map((b: any) => ({
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
