import { PrismaClient } from "@prisma/client";
import { logInfo } from "../utils/logger";

const prisma = new PrismaClient();

//Obtener los Waid unicos de la base de datos
// Obtener los Waid únicos de la base de datos filtrados por grupo
export async function getLatestMessagesPerWaid(groupId?: number) {
  try {
    // Construir el filtro base
    const whereFilter: any = {};
    
    // Si se proporciona groupId, buscar la integración correspondiente
    if (groupId !== null && groupId !== undefined) {
      const groupIntegration = await prisma.groupIntegration.findFirst({
        where: { groupId: groupId },
        select: { id: true }
      });
      
      if (groupIntegration) {
        whereFilter.groupIntegrationId = groupIntegration.id;
      }
    }

    const latestMessages = await prisma.whatsappMessage.findMany({
      where: whereFilter,
      distinct: ['wa_id'],
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        wa_id: true,
        body_text: true,
        direction: true,
        read: true,
        createdAt: true,
        groupIntegrationId: true,
        groupIntegration: {
          select: {
            id: true,
            groupId: true
          }
        }
      },
    });

    const results = await Promise.all(
      latestMessages.map(async (msg) => {
        const unreadCount = await prisma.whatsappMessage.count({
          where: {
            wa_id: msg.wa_id,
            direction: 'inbound', // Según tu modelo, debería ser 'inbound'
            read: false,
            // También filtrar por groupIntegrationId en el conteo
            ...(whereFilter.groupIntegrationId && { groupIntegrationId: whereFilter.groupIntegrationId }),
          },
        });
        return {
          ...msg,
          unreadCount,
        };
      })
    );

    logInfo(`✅ Últimos mensajes por WAID obtenidos con contador para grupo ${groupId || 'todos'}: ${results.length}`);
    return results;
  } catch (error) {
    logInfo(`❌ Error al obtener últimos mensajes por WAID: ${error}`);
    return [];
  }
}