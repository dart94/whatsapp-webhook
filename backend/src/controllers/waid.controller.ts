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
// Tu controller corregido
export const getUniqueWaidsController = async (req: Request, res: Response) => {
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

    // El token puede venir como "Bearer TOKEN" o solo "TOKEN"
    const token = authHeader.startsWith('Bearer ') 
      ? authHeader.replace('Bearer ', '') 
      : authHeader;

    // Verificar que JWT_SECRET esté configurado
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      logInfo('❌ JWT_SECRET no está configurado');
      return res.status(500).json({
        success: false,
        message: "Error de configuración del servidor",
      });
    }

    // Decodificar y verificar token
    let user: DecodedToken;
    try {
      user = jwt.verify(token, jwtSecret) as DecodedToken;
      logInfo(`✅ Token válido para usuario: ${user.email} (ID: ${user.id})`);
    } catch (jwtError: any) {
      logInfo(`❌ Error al verificar token: ${jwtError.message}`);
      
      // Más información específica sobre el error del token
      if (jwtError.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          message: "Token expirado",
        });
      } else if (jwtError.name === 'JsonWebTokenError') {
        return res.status(401).json({
          success: false,
          message: "Token inválido",
        });
      } else {
        return res.status(401).json({
          success: false,
          message: "Error de autenticación",
        });
      }
    }

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
      message: "Error interno del servidor",
      // Solo mostrar detalles en desarrollo
      ...(process.env.NODE_ENV === 'development' && { details: error.message })
    });
  }
};