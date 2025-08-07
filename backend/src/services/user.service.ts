import { PrismaClient } from "@prisma/client";
import { logInfo } from "../utils/logger";
import { hashPassword } from "../utils/hashPassword";

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
export async function createUser(userData: {
  name: string;
  email: string;
  password: string;
  isAdmin?: boolean;
  IsActive?: boolean;
}) {
  try {
    // Verificar si el usuario ya existe
    const existingUser = await prisma.user.findUnique({
      where: { email: userData.email },
    });

    if (existingUser) {
      throw new Error("El correo ya está registrado.");
    }

    const hashedPassword = await hashPassword(userData.password);

    const newUser = await prisma.user.create({
      data: {
        name: userData.name,
        email: userData.email,
        password: hashedPassword,
        isAdmin: userData.isAdmin ?? false,
        IsActive: userData.IsActive ?? true,
      },
    });

    return newUser;
  } catch (error) {
    throw error;
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