import { Request, Response } from 'express';
import { getWhatsAppTemplates } from '../services/template.service';
import { logInfo, logError } from '../utils/logger';

export const getTemplates = async (req: Request, res: Response) => {
  try {
    const templates = await getWhatsAppTemplates();
    logInfo(`✅ Enviando ${templates.length} plantillas al cliente.`);

    return res.status(200).json({
      success: true,
      data: templates,
    });
  } catch (error) {
    logError(`❌ Error en getTemplates: ${error}`);
    return res.status(500).json({
      success: false,
      message: 'Error al obtener plantillas de WhatsApp.',
    });
  }
};
