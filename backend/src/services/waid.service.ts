import { PrismaClient } from "@prisma/client";
import { logInfo } from "../utils/logger";

const prisma = new PrismaClient();

/**
 * Obtiene el último mensaje por combinación (wa_id, groupIntegrationId).
 * Si se pasa groupId, filtra por la integración del grupo.
 */
export async function getLatestMessagesPerWaid(groupId?: number) {
  try {
    const whereFilter: any = {};

    // Si hay groupId, buscamos su integración y filtramos por ella
    if (groupId !== null && groupId !== undefined) {
      const groupIntegration = await prisma.groupIntegration.findFirst({
        where: { groupId },
        select: { id: true },
      });

      if (!groupIntegration) {
        logInfo(`ℹ️ No se encontró groupIntegration para groupId=${groupId}`);
        return [];
      }

      whereFilter.groupIntegrationId = groupIntegration.id;
    }

    /**
     * IMPORTANTE:
     * - Usamos distinct en ['wa_id','groupIntegrationId'] para no mezclar conversaciones
     *   entre grupos que comparten el mismo wa_id.
     * - orderBy por createdAt desc para que el "primer" registro por combinación
     *   sea el más reciente (Prisma aplica el distinct después del ordenamiento).
     */
    const latestMessages = await prisma.whatsappMessage.findMany({
      where: whereFilter,
      distinct: ["wa_id", "groupIntegrationId"],
      orderBy: {
        createdAt: "desc",
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
            groupId: true,
          },
        },
      },
    });

    // Adjuntamos contador de no leídos por (wa_id, groupIntegrationId)
    const results = await Promise.all(
      latestMessages.map(async (msg) => {
        const unreadCount = await prisma.whatsappMessage.count({
          where: {
            wa_id: msg.wa_id,
            groupIntegrationId: msg.groupIntegrationId ?? undefined, // clave para no mezclar
            direction: "inbound",
            read: false,
          },
        });

        return {
          ...msg,
          unreadCount,
        };
      })
    );

    logInfo(
      `✅ Últimos mensajes por (wa_id, groupIntegrationId) obtenidos para grupo ${
        groupId ?? "todos"
      }: ${results.length}`
    );
    return results;
  } catch (error) {
    logInfo(`❌ Error al obtener últimos mensajes por WAID: ${error}`);
    return [];
  }
}
