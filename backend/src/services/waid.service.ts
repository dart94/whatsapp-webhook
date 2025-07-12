import { PrismaClient } from "@prisma/client";
import { logInfo } from "../utils/logger";

const prisma = new PrismaClient();

//Obtener los Waid unicos de la base de datos
export async function getUniqueWaids() {
  try {
    const waids = await prisma.whatsappMessage.groupBy({
      by: ["wa_id"],
      _count: {
        _all: true,
      },
    });

    const uniqueWaids = waids.map((w) => w.wa_id);

    logInfo(`✅ WAIDs únicos obtenidos: ${uniqueWaids.length}`);

    return uniqueWaids;
  } catch (error) {
    logInfo(`❌ Error al obtener WAIDs únicos: ${error}`);
    return [];
  }
}