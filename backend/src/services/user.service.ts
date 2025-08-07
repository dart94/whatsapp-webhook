import { PrismaClient } from "@prisma/client";
import { logInfo } from "../utils/logger";
import { hashPassword } from "../utils/hashPassword";

const prisma = new PrismaClient();

// Obtener usuarios
export async function getUsers() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        isAdmin: true,
        isActive: true, // Corregido: era IsActive
      },
    });
    logInfo(`✅ Usuarios obtenidos: ${users.length}`);
    return users;
  } catch (error) {
    logInfo(`❌ Error al obtener usuarios: ${error}`);
    return [];
  }
}

// Obtener usuario por ID
export async function getUserById(id: number) { // Cambiado: string -> number
  try {
    const user = await prisma.user.findUnique({
      where: {
        id, // Ahora espera number
      },
      select: {
        id: true,
        name: true,
        email: true,
        isAdmin: true,
        isActive: true, // Corregido: era IsActive
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
  isActive?: boolean; // Corregido: era IsActive
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
        isActive: userData.isActive ?? true, // Corregido: era IsActive
      },
    });
    return newUser;
  } catch (error) {
    throw error;
  }
}

// Actualizar usuario
export async function updateUser(id: number, userData: { // Cambiado: string -> number
  name?: string;
  email?: string;
  password?: string;
  isAdmin?: boolean;
  isActive?: boolean;
}) {
  try {
    // Si se proporciona password, hashearlo
    const updateData: any = { ...userData };
    if (userData.password) {
      updateData.password = await hashPassword(userData.password);
    }

    const updatedUser = await prisma.user.update({
      where: {
        id, // Ahora espera number
      },
      data: updateData,
    });
    logInfo(`✅ Usuario actualizado: ${updatedUser.name}`);
    return updatedUser;
  } catch (error) {
    logInfo(`❌ Error al actualizar usuario: ${error}`);
    return null;
  }
}

// Eliminar usuario
export async function deleteUser(id: number) { // Cambiado: string -> number
  try {
    const deletedUser = await prisma.user.delete({
      where: {
        id, // Ahora espera number
      },
    });
    logInfo(`✅ Usuario eliminado: ${deletedUser.name}`);
    return deletedUser;
  } catch (error) {
    logInfo(`❌ Error al eliminar usuario: ${error}`);
    return null;
  }
}

// Función auxiliar para obtener usuario por email
export async function getUserByEmail(email: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });
    return user;
  } catch (error) {
    logInfo(`❌ Error al obtener usuario por email: ${error}`);
    return null;
  }
}