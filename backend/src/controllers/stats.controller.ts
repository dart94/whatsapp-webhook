import { Request, Response } from "express";
import { getTemplateStatsService } from "../services/stats.service";
import { statsQuerySchema } from "../utils/_utils";
import { parseRange } from "../utils/_utils";
import { logInfo } from "../utils/logger";

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