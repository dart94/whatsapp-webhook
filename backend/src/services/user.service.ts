import { PrismaClient } from "@prisma/client";
import { logInfo } from "../utils/logger";

const prisma = new PrismaClient();

//Obtener usuarios
export async function getUsers() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        isAdmin: true,
        IsActive: true,
      },
    });

    logInfo(`✅ Usuarios obtenidos: ${users.length}`);
    return users;
  } catch (error) {
    logInfo(`❌ Error al obtener usuarios: ${error}`);
    return [];
  }
}

//Obtener usuario por ID
export async function getUserById(id: string) {
  try {
    const user = await prisma.user.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        name: true,
        email: true,
        isAdmin: true,
        IsActive: true,
      },
    });

    logInfo(`✅ Usuario obtenido: ${user?.name}`);
    return user;
  } catch (error) {
    logInfo(`❌ Error al obtener usuario: ${error}`);
    return null;
  }
}

// Crear nuevo usuario
export async function createUser(user: any) {
  try {
    const newUser = await prisma.user.create({
      data: {
        name: user.name,
        email: user.email,
        password: user.password,
        isAdmin: user.isAdmin,
        IsActive: user.IsActive,
      },
    });

    logInfo(`✅ Usuario creado: ${newUser.name}`);
    return newUser;
  } catch (error) {
    logInfo(`❌ Error al crear usuario: ${error}`);
    return null;
  }
}

// Actualizar usuario
export async function updateUser(id: string, user: any) {
  try {
    const updatedUser = await prisma.user.update({
      where: {
        id,
      },
      data: {
        name: user.name,
        email: user.email,
        password: user.password,
        isAdmin: user.isAdmin,
        IsActive: user.IsActive,
      },
    });

    logInfo(`✅ Usuario actualizado: ${updatedUser.name}`);
    return updatedUser;
  } catch (error) {
    logInfo(`❌ Error al actualizar usuario: ${error}`);
    return null;
  }
}

// Eliminar usuario
export async function deleteUser(id: string) {
  try {
    const deletedUser = await prisma.user.delete({
      where: {
        id,
      },
    });

    logInfo(`✅ Usuario eliminado: ${deletedUser.name}`);
    return deletedUser;
  } catch (error) {
    logInfo(`❌ Error al eliminar usuario: ${error}`);
    return null;
  }
}