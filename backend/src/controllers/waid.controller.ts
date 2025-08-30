// controllers/whatsappController.ts
import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { getLatestMessagesPerWaid } from '../services/waid.service';
import { logInfo } from '../utils/logger';

// Interface para el token decodificado
interface DecodedToken {
  id: number;
  name: string;
  email: string;
  isAdmin: boolean;
  groupId: number | null;
  integration: {
    phoneNumberId?: string;
    accessTokenId?: string;
  };
}

// Función para extraer información del token
function extractUserFromToken(token: string): DecodedToken {
  try {
    const jwtSecret = process.env.JWT_SECRET!;
    const decoded = jwt.verify(token, jwtSecret) as DecodedToken;
    return decoded;
  } catch (error) {
    throw new Error('Token inválido');
  }
}

// Controller principal que filtra por grupo del usuario
export const getUniqueWaidsController = async (req: Request, res: Response) => {
  try {
    // Extraer token del header Authorization
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: "Token de autorización requerido",
      });
    }

    const token = authHeader.replace('Bearer ', '');
    
    // Decodificar token para obtener información del usuario
    let user: DecodedToken;
    try {
      user = extractUserFromToken(token);
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: "Token inválido",
      });
    }

    // Obtener mensajes según los permisos del usuario
    let waids;
    if (user.isAdmin) {
      // Los admin pueden ver todos los mensajes
      waids = await getLatestMessagesPerWaid();
    } else {
      // Los usuarios normales solo ven mensajes de su grupo
      if (!user.groupId) {
        return res.status(403).json({
          success: false,
          message: "Usuario no asignado a ningún grupo",
        });
      }
      waids = await getLatestMessagesPerWaid(user.groupId);
    }

    return res.status(200).json({
      success: true,
      data: waids,
      userInfo: {
        isAdmin: user.isAdmin,
        groupId: user.groupId,
        totalMessages: waids.length
      }
    });

  } catch (error) {
    logInfo(`❌ Error al obtener WAIDs únicos: ${error}`);
    return res.status(500).json({
      success: false,
      message: "Error getting unique WAIDs.",

    });
  }
};