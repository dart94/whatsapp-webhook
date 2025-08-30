import { Request, Response } from "express";
import { getLatestMessagesPerWaid } from "../services/waid.service";
import { logInfo } from "../utils/logger";

// GET /waid?groupId=123
export const getUniqueWaidsController = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user as { isAdmin: boolean; groupId: number | null } | undefined;
    if (!user) {
      return res.status(401).json({ success: false, message: "No autorizado" });
    }

    const raw = req.query.groupId as string | undefined;
    let requestedGroupId: number | undefined =
      raw !== undefined && raw !== null && raw !== "" ? Number(raw) : undefined;

    if (raw !== undefined && Number.isNaN(requestedGroupId)) {
      return res.status(400).json({ success: false, message: "El parámetro groupId debe ser numérico." });
    }

    // 🚧 Si NO es admin, solo puede ver su propio grupo
    if (!user.isAdmin) {
      if (user.groupId == null) {
        // usuario sin grupo asignado: no puede ver nada
        return res.status(200).json({ success: true, data: [] });
      }
      // Ignora un groupId ajeno y fuerza el suyo
      requestedGroupId = user.groupId;
    }

    const waids = await getLatestMessagesPerWaid(requestedGroupId);

    return res.status(200).json({
      success: true,
      data: waids,
    });
  } catch (error) {
    logInfo(`❌ Error al obtener WAIDs únicos: ${error}`);
    return res.status(500).json({
      success: false,
      message: "Error getting unique WAIDs.",
    });
  }
};