import { Request, Response } from "express";
import { getWhatsAppTemplates } from "../services/template.service";
import { logError } from "../utils/logger";
import { WhatsAppTemplate, WhatsAppButton } from "../interface/whatsapp.interface";
import { prisma } from "../prisma";
import { validateToken } from "../services/auth.service";

// Obtener plantillas de WhatsApp
export const getTemplates = async (req: Request, res: Response) => {
  try {
    // ✅ Obtener token del header
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ success: false, message: "Token required" });
    }

    // ✅ Validar token
    const decoded = await validateToken(token);
    if (!decoded || typeof decoded !== "object") {
      return res.status(401).json({ success: false, message: "Invalid token" });
    }

    const userId = (decoded as any).id;

    // ✅ Obtener groupId del usuario
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { groupId: true },
    });

    if (!user?.groupId) {
      return res.status(400).json({
        success: false,
        message: "User has no associated group",
      });
    }

    // ✅ Buscar integración activa
    const integration = await prisma.groupIntegration.findFirst({
      where: { groupId: user.groupId },
      select: { Waba_id: true, accessTokenId: true },
    });

    if (!integration || !integration.Waba_id || !integration.accessTokenId) {
      return res.status(400).json({
        success: false,
        message: "Integration data (wabaId, accessTokenId) missing",
      });
    }

    const { Waba_id, accessTokenId } = integration;

    // ✅ Llamar service con valores dinámicos
    const templates = await getWhatsAppTemplates(accessTokenId, Waba_id);

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

    return res.status(200).json({
      success: true,
      data: mappedTemplates,
    });

  } catch (error) {
    logError(`❌ Error en getTemplates: ${error}`);
    return res.status(500).json({
      success: false,
      message: "Error al obtener plantillas de WhatsApp.",
    });
  }
};