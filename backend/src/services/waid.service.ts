import { PrismaClient } from "@prisma/client";
import { logInfo } from "../utils/logger";

const prisma = new PrismaClient();

//Obtener los Waid unicos de la base de datos
export async function getLatestMessagesPerWaid() {
  try {
    const messages = await prisma.whatsappMessage.findMany({
      distinct: ['wa_id'], // Obtiene 1 por wa_id
      orderBy: {
        createdAt: 'desc', // Del más nuevo al más viejo
      },
      select: {
        wa_id: true,
        body_text: true,
        direction: true,
        read: true,
        createdAt: true,

      },
    });

    logInfo(`✅ Últimos mensajes por WAID obtenidos: ${messages.length}`);
    return messages;
  } catch (error) {
    logInfo(`❌ Error al obtener últimos mensajes por WAID: ${error}`);
    return [];
  }
}
