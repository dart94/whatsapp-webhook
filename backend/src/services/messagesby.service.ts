import { PrismaClient } from "@prisma/client";
import { logInfo } from "../utils/logger";
import { getUserGroupIdOrThrow } from "./authz.service";

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

//------------------------------------------------------------------------------
// Funciones para obtener mensajes por WAID por grupo
//------------------------------------------------------------------------------

// Obtener mensajes por WAID
export async function getMessagesByWaidForUser(wa_id: string, actorUserId: number) {
  const groupId = await getUserGroupIdOrThrow(actorUserId);

  const messages = await prisma.whatsappMessage.findMany({
    where: {
      wa_id,
      // 🔒 Solo mensajes cuya integración pertenece al grupo del usuario
      groupIntegration: { groupId },
      // Si tienes mensajes legacy con groupIntegrationId = null, los EXCLUIMOS por seguridad.
    },
    orderBy: { createdAt: "asc" },
    select: {
      wa_id: true,
      body_text: true,
      direction: true,
      createdAt: true,
    },
  });

  return messages;
}

export async function getUnreadCountsPerConversationForGroup(groupId: number) {
  // Cuenta solo no leídos entrantes del grupo del usuario
  return prisma.whatsappMessage.groupBy({
    by: ["wa_id"],
    where: {
      read: false,
      direction: "inbound",
      groupIntegration: { groupId },
    },
    _count: { id: true },
  });
}

export async function fetchConversationsForUser(actorUserId: number) {
  const groupId = await getUserGroupIdOrThrow(actorUserId);

  // 1) Último mensaje por conversación (WAID), SOLO del grupo del usuario
  const latest = await prisma.whatsappMessage.findMany({
    where: {
      groupIntegration: { groupId },
    },
    orderBy: [
      { wa_id: "asc" },
      { createdAt: "desc" }, // para que distinct coja el más reciente por wa_id
    ],
    distinct: ["wa_id"],
    select: {
      wa_id: true,
      body_text: true,
      direction: true,
      createdAt: true,
    },
  });

  // 2) Unread counts SOLO del grupo
  const unread = await getUnreadCountsPerConversationForGroup(groupId);
  const unreadMap = Object.fromEntries(unread.map(u => [u.wa_id, u._count.id]));

  // 3) Combinar
  return latest.map(m => ({
    wa_id: m.wa_id,
    direction: m.direction,
    body_text: m.body_text,
    createdAt: m.createdAt,
    unreadCount: unreadMap[m.wa_id] ?? 0,
  }));
}