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

// OPCIÓN 1: Usando validateToken (como en getTemplates que funciona)
export const getUniqueWaidsController = async (req: Request, res: Response) => {
  try {
    // ✅ Obtener token del header (mismo patrón que getTemplates)
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      logInfo('❌ No se encontró token en header de autorización');
      return res.status(401).json({
        success: false,
        message: "Token required",
      });
    }

    // ✅ Validar token usando la misma función que funciona en getTemplates
    const decoded = await validateToken(token);
    if (!decoded || typeof decoded !== "object") {
      logInfo('❌ Token inválido o decodificación fallida');
      return res.status(401).json({
        success: false,
        message: "Invalid token"
      });
    }

    const user = decoded as any; // Cast para acceder a las propiedades
    logInfo(`✅ Token válido para usuario: ${user.email} (ID: ${user.id})`);

    // Obtener mensajes según los permisos del usuario
    let waids;
    
    if (user.isAdmin) {
      logInfo(`👑 Admin ${user.email} solicitando todos los mensajes`);
      // Los admin pueden ver todos los mensajes
      waids = await getLatestMessagesPerWaid();
    } else {
      logInfo(`👤 Usuario ${user.email} solicitando mensajes de grupo ${user.groupId}`);
      // Los usuarios normales solo ven mensajes de su grupo
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
      message: "Error al obtener conversaciones únicas.",
      // Solo mostrar detalles en desarrollo
      ...(process.env.NODE_ENV === 'development' && { details: error.message })
    });
  }
};