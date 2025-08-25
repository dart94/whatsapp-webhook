//service para grupos
import { PrismaClient } from "@prisma/client";
import { logInfo } from "../utils/logger";

const prisma = new PrismaClient();

//Obtener grupos
export async function getGroups() {
  try {
    const groups = await prisma.group.findMany({
      select: {
        id: true,
        name: true,
      },
    });
    logInfo(`✅ Grupos obtenidos: ${groups.length}`);
    return groups;
  } catch (error) {
    logInfo(`❌ Error al obtener grupos: ${error}`);
    return [];
  }
}
//Obtener grupo por ID
export async function getGroupById(id: number) {
  try {
    const group = await prisma.group.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        name: true,
      },
    });
    logInfo(`✅ Grupo obtenido: ${group?.name}`);
    return group;
  } catch (error) {
    logInfo(`❌ Error al obtener grupo: ${error}`);
    return null;
  }
}

// Crear nuevo grupo
export async function createGroup(groupData: {
  name: string;
}) {
  try {
    const newGroup = await prisma.group.create({
      data: {
        name: groupData.name,
      },
    });
    return newGroup;
  } catch (error) {
    throw error;
  }
}

// Actualizar grupo
export async function updateGroup(id: number, groupData: {
  name?: string;
}) {
  try {
    const updatedGroup = await prisma.group.update({
      where: {
        id,
      },
      data: groupData,
    });
    logInfo(`✅ Grupo actualizado: ${updatedGroup.name}`);
    return updatedGroup;
  } catch (error) {
    logInfo(`❌ Error al actualizar grupo: ${error}`);
    return null;
  }
}

// Eliminar grupo
export async function deleteGroup(id: number) {
  try {
    const deletedGroup = await prisma.group.delete({
      where: {
        id,
      },
    });
    logInfo(`✅ Grupo eliminado: ${deletedGroup.name}`);
    return deletedGroup;
  } catch (error) {
    logInfo(`❌ Error al eliminar grupo: ${error}`);
    return null;
  }
}