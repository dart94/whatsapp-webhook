
import { Request, Response } from "express";
import { getUniqueWaids } from "../services/waid.service";
import { logInfo } from "../utils/logger";

//Obtener WAIDs únicos
export const getUniqueWaidsController = async (req: Request, res: Response) => {
  try {
    const waids = await getUniqueWaids();

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