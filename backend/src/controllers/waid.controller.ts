// controllers/whatsappController.ts
import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { getLatestMessagesPerWaid } from '../services/waid.service';
import { logInfo } from '../utils/logger';
import { validateToken } from '../services/auth.service';

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

// FUNCIÓN ALTERNATIVA: Si quieres mantener el patrón original pero corregido
export const getUniqueWaidsControllerAlternative = async (req: Request, res: Response) => {
  try {
    // Extraer token del header Authorization
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      logInfo('❌ No se encontró header de autorización');
      return res.status(401).json({
        success: false,
        message: "Token de autorización requerido",
      });
    }

    // Extraer token - soportar ambos formatos
    let token: string;
    if (authHeader.startsWith('Bearer ')) {
      token = authHeader.replace('Bearer ', '');
    } else {
      token = authHeader.split(" ")[1] || authHeader;
    }

    logInfo(token);

    // Validar token usando la función del backend
    const decoded = validateToken(token);
    if (!decoded || typeof decoded !== "object") {
      logInfo('❌ Token inválido o decodificación fallida');
      return res.status(401).json({
        success: false,
        message: "Token inválido"
      });
    }

    const user = decoded as any;
    logInfo(`✅ Token válido para usuario: ${user.email} (ID: ${user.id})`);

    // Obtener mensajes según los permisos del usuario
    let waids;
    
    if (user.isAdmin) {
      logInfo(`👑 Admin ${user.email} solicitando todos los mensajes`);
      waids = await getLatestMessagesPerWaid();
    } else {
      logInfo(`👤 Usuario ${user.email} solicitando mensajes de grupo ${user.groupId}`);
      if (!user.groupId) {
        return res.status(403).json({
          success: false,
          message: "Usuario no asignado a ningún grupo",
        });
      }
      waids = await getLatestMessagesPerWaid(user.groupId);
    }

    logInfo(`✅ Enviando ${waids.length} conversaciones únicas`);

    return res.status(200).json({
      success: true,
      data: waids,
      userInfo: {
        isAdmin: user.isAdmin,
        groupId: user.groupId,
        totalMessages: waids.length,
        userId: user.id,
        userName: user.name
      }
    });

  } catch (error: any) {
    logInfo(`❌ Error al obtener WAIDs únicos: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: "Error interno del servidor",
      ...(process.env.NODE_ENV === 'development' && { details: error.message })
    });
  }
};