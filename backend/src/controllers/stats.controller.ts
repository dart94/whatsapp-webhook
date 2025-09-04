import { Request, Response } from "express";
import { getTemplateStatsService, getAllTemplateMessagesService } from "../services/stats.service";
import { statsQuerySchema } from "../utils/_utils";
import { parseRange } from "../utils/_utils";
import { logInfo } from "../utils/logger";

//Obtener estadísticas de plantillas
export const getTemplateStatsController = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user; // set por checkAuth
    if (!user) {
      return res.status(401).json({ success: false, message: "No autorizado" });
    }

    // parsea rango y groupId
    const { start, end, groupId } = parseRange(req.query as any);

    // Si NO es admin, forzar su groupId
    const forceGroupId = user.isAdmin ? undefined : user.groupId ?? null;

    const data = await getTemplateStatsService({
      start,
      end,
      groupId: groupId ?? undefined,
      forceGroupId,
    });

    return res.status(200).json({ success: true, data });
  } catch (error: any) {
    logInfo(`❌ Error en getTemplateStatsController: ${error?.message ?? error}`);
    return res.status(500).json({ success: false, message: "Error al obtener estadísticas de plantillas" });
  }
};


//Obtener todos los mensajes de plantilla
export const getAllTemplateMessagesController = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user; // set por checkAuth
    if (!user) {
      return res.status(401).json({ success: false, message: "No autorizado" });
    }

    // Query params
    const { startDate, endDate, status } = req.query;

    const options = {
      startDate: startDate ? new Date(startDate as string) : undefined,
      endDate: endDate ? new Date(endDate as string) : undefined,
      status: status ? (status as string).toUpperCase() : undefined,
    };

    const messages = await getAllTemplateMessagesService(options);

    return res.status(200).json({
      success: true,
      count: messages.length,
      data: messages,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: "Error al obtener mensajes template",
      error: error.message ?? error,
    });
  }
};