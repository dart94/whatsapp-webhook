import { Request, Response } from "express";
import { getLatestMessagesPerWaid } from "../services/waid.service";
import { logInfo } from "../utils/logger";

// GET /waid?groupId=123
export const getUniqueWaidsController = async (req: Request, res: Response) => {
  try {
    const raw = req.query.groupId as string | undefined;
    const groupId =
      raw !== undefined && raw !== null && raw !== ""
        ? Number(raw)
        : undefined;

    if (raw !== undefined && Number.isNaN(groupId)) {
      return res.status(400).json({
        success: false,
        message: "El parámetro groupId debe ser numérico.",
      });
    }

    const waids = await getLatestMessagesPerWaid(groupId);

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
