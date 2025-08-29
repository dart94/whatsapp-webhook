import { Request, Response } from "express";
import { getMessagesByWaid, fetchConversations, fetchConversationsForUser,getMessagesByWaidForUser } from "../services/messagesby.service";
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


export async function getMessagesByWaidGroupController(req: Request, res: Response) {
  try {
    const wa_id = req.params.wa_id;            // /conversations/:wa_id/messages
    const actorUserId = req.params.actorUserId; // /conversations/:wa_id/messages
    const msgs = await getMessagesByWaidForUser(wa_id, Number(actorUserId));
    if (msgs.length === 0) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: conversation not accessible",
      });
    }
    return res.json({ success: true, data: msgs });
  } catch (e: any) {
    if (e.code === "NO_GROUP") {
      return res.status(400).json({ success: false, message: e.message });
    }
    return res.status(500).json({ success: false, message: "Server error" });
  }
}

export async function fetchConversationsGroupController(req: Request, res: Response) {
  try {
    const actorUserId = req.params.actorUserId; 
    const convos = await fetchConversationsForUser(Number(actorUserId));
    return res.json({ success: true, data: convos });
  } catch (e: any) {
    if (e.code === "NO_GROUP") {
      return res.status(400).json({ success: false, message: e.message });
    }
    return res.status(500).json({ success: false, message: "Server error" });
  }
}