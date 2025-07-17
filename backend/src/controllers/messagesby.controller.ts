import { Request, Response } from "express";
import { getMessagesByWaid, fetchConversations } from "../services/messagesby.service";
import { logInfo } from "../utils/logger";

//Obtener mensajes por WAID
export const getMessagesByWaidController = async (req: Request, res: Response) => {
  const wa_id = req.params.wa_id;

  if (!wa_id) {
    return res.status(400).json({
      success: false,
      message: "wa_id is required",
    });
  }

  const messages = await getMessagesByWaid(wa_id);
  return res.json({
    success: true,
    data: messages,
  });
};


//Obtener conversaciones
export const fetchConversationsController = async (req: Request, res: Response) => {
  const conversations = await fetchConversations();
  return res.json({
    success: true,
    data: conversations,
  });
};