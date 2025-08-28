//service para grupos
import { PrismaClient } from "@prisma/client";
import { logInfo } from "../utils/logger";

const prisma = new PrismaClient();

//Obtener integración de grupos
export async function getGroupIntegrations() {
  try {
    const groupIntegrations = await prisma.groupIntegration.findMany({
      select: {
        id: true,
        phoneNumberId: true,
        accessTokenId: true,
        groupId: true,
        Waba_id: true,
        group: { select: { id: true, name: true } },
      },
    });
    logInfo(`✅ Grupos integrados obtenidos: ${groupIntegrations.length}`);
    return groupIntegrations;
  } catch (error) {
    logInfo(`❌ Error al obtener grupos: ${error}`);
    return [];
  }
}

//obtener integracion de grupo por ID
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
        Waba_id: true,
      },
    });
    logInfo(`✅ Grupo integrado obtenido: ${groupIntegration?.id}`);
    return groupIntegration;
  } catch (error) {
    logInfo(`❌ Error al obtener grupo: ${error}`);
    return null;
  }
}

//Crear integración de grupo
export async function createGroupIntegration(
  phoneNumberId: string,
  accessTokenId: string,
  groupId: number,
  Waba_id?: string
) {
  try {
    const groupIntegration = await prisma.groupIntegration.create({
      data: {
        phoneNumberId,
        accessTokenId,
        groupId,
        Waba_id,
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

// Actualizar integracion de grupo
export async function updateGroupIntegration(
  id: number,
  phoneNumberId: string,
  accessTokenId: string,
  groupId: number,
  Waba_id?: string
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
        Waba_id: Waba_id,
      },
    });
    logInfo(`✅ Grupo integrado actualizado: ${groupIntegration.id}`);
    return groupIntegration;
  } catch (error) {
    logInfo(`❌ Error al actualizar grupo: ${error}`);
    return null;
  }
}

//Eliminar integracion de grupo
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

// Obtener integración de grupo por groupId
export async function getGroupIntegrationByGroupId(groupId: number) {
  try {
    const groupIntegration = await prisma.groupIntegration.findFirst({
      where: {
        groupId: groupId,
      },
      select: {
        id: true,
        phoneNumberId: true,
        accessTokenId: true,
        groupId: true,
        Waba_id: true,
      },
    });

    logInfo(`✅ Integración obtenida para groupId ${groupId}: ${groupIntegration?.id}`);
    return groupIntegration;
  } catch (error) {
    logInfo(`❌ Error al obtener integración por groupId: ${error}`);
    return null;
  }
}