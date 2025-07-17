import { PrismaClient } from "@prisma/client";
import { logInfo } from "../utils/logger";

const prisma = new PrismaClient();

//Obtener los Waid unicos de la base de datos
export async function getLatestMessagesPerWaid() {
  try {
    const latestMessages = await prisma.whatsappMessage.findMany({
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
      },
    });

    const results = await Promise.all(
      latestMessages.map(async (msg) => {
        const unreadCount = await prisma.whatsappMessage.count({
          where: {
            wa_id: msg.wa_id,
            direction: 'IN',
            read: false,
          },
        });

        return {
          ...msg,
          unreadCount,
        };
      })
    );

    logInfo(`✅ Últimos mensajes por WAID obtenidos con contador: ${results.length}`);
    return results;
  } catch (error) {
    logInfo(`❌ Error al obtener últimos mensajes por WAID: ${error}`);
    return [];
  }
}