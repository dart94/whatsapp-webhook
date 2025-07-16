import { PrismaClient } from "@prisma/client";
import { logInfo } from "../utils/logger";

const prisma = new PrismaClient();

//Obtener mensajes por WAID
export async function getMessagesByWaid(wa_id: string) {
  try {
    const messages = await prisma.whatsappMessage.findMany({
      where: {
        wa_id,
      },
      orderBy: {
        createdAt: 'asc', // Del más nuevo al más viejo
      },
      select: {
        wa_id: true,
        body_text: true,
        direction: true,
        createdAt: true,
      },
    });

    logInfo(`✅ Mensajes por WAID obtenidos: ${messages.length}`);
    return messages;
  } catch (error) {
    logInfo(`❌ Error al obtener mensajes por WAID: ${error}`);
    return [];
  }
}


//Contar los mensajes sin leer por WAID
export async function getUnreadCountsPerConversation() {
  const counts = await prisma.whatsappMessage.groupBy({
    by: ['wa_id'],
    _count: {
      id: true,
    },
    where: {
      read: false,
      direction: 'IN',
    },
  });

  return counts;
}