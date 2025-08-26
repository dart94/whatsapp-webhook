//service para grupos
import { PrismaClient } from "@prisma/client";
import { logInfo } from "../utils/logger";

const prisma = new PrismaClient();

//Obtener grupos
export async function getGroupIntegrations() {
  try {
    const groupIntegrations = await prisma.groupIntegration.findMany({
      select: {
        id: true,
        phoneNumberId: true,
        accessTokenId: true,
        groupId: true,
      },
    });
    logInfo(`✅ Grupos integrados obtenidos: ${groupIntegrations.length}`);
    return groupIntegrations;
  } catch (error) {
    logInfo(`❌ Error al obtener grupos: ${error}`);
    return [];
  }
}

//obtener grupo por id
export async function getGroupIntegrationById(id: number) {
  try {
    const groupIntegration = await prisma.groupIntegration.findUnique({
      where: {
        id: id,
      },
      select: {
        id: true,
        phoneNumberId: true,
        accessTokenId: true,
        groupId: true,
      },
    });
    logInfo(`✅ Grupo integrado obtenido: ${groupIntegration?.id}`);
    return groupIntegration;
  } catch (error) {
    logInfo(`❌ Error al obtener grupo: ${error}`);
    return null;
  }
}

//Crear grupo
export async function createGroupIntegration(
  phoneNumberId: number,
  accessTokenId: string,
  groupId: number
) {
  try {
    const groupIntegration = await prisma.groupIntegration.create({
      data: {
        phoneNumberId,
        accessTokenId,
        groupId,
      },
    });
    logInfo(`✅ Grupo integrado creado: ${groupIntegration.id}`);
    return groupIntegration;
  } catch (error) {
    logInfo(`❌ Error al crear grupo: ${error}`);
    // Retornamos el error para debug
    return { error: String(error) };
  }
}

// Actualizar grupo
export async function updateGroupIntegration(
  id: number,
  phoneNumberId: number,
  accessTokenId: string,
  groupId: number
) {
  try {
    const groupIntegration = await prisma.groupIntegration.update({
      where: {
        id: id,
      },
      data: {
        phoneNumberId: phoneNumberId,
        accessTokenId: accessTokenId,
        groupId: groupId,
      },
    });
    logInfo(`✅ Grupo integrado actualizado: ${groupIntegration.id}`);
    return groupIntegration;
  } catch (error) {
    logInfo(`❌ Error al actualizar grupo: ${error}`);
    return null;
  }
}

//Eliminar grupo
export async function deleteGroupIntegration(id: number) {
  try {
    const groupIntegration = await prisma.groupIntegration.delete({
      where: {
        id: id,
      },
    });
    logInfo(`✅ Grupo integrado eliminado: ${groupIntegration.id}`);
    return groupIntegration;
  } catch (error) {
    logInfo(`❌ Error al eliminar grupo: ${error}`);
    return null;
  }
}