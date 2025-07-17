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


//
export async function fetchConversations() {
  try {
    // ✅ 1. Últimos mensajes únicos por WAID
    const latestMessages = await prisma.whatsappMessage.findMany({
      orderBy: [
        { wa_id: "asc" },
        { createdAt: "desc" },
      ],
      distinct: ["wa_id"],
      select: {
        wa_id: true,
        body_text: true,
        direction: true,
        createdAt: true,
      },
    });

    // ✅ 2. Unread counts
    const unreadCounts = await getUnreadCountsPerConversation();

    // Convertir a mapa para acceso rápido
    const unreadCountMap = Object.fromEntries(
      unreadCounts.map((u) => [u.wa_id, u._count.id])
    );

    // ✅ 3. Combinar los datos
    const conversations = latestMessages.map((msg) => ({
      wa_id: msg.wa_id,
      direction: msg.direction,
      body_text: msg.body_text,
      createdAt: msg.createdAt,
      unreadCount: unreadCountMap[msg.wa_id] ?? 0,
    }));

    return conversations;
  } catch (error) {
    console.error("❌ Error fetching conversations", error);
    return [];
  }
}