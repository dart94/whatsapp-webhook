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
        IsActive: true,
        groupId: true,
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
        IsActive: true, // Corregido: era IsActive
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
  groupId?: number;
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
        groupId: userData.groupId ?? null,
      },
    });
    return newUser;
  } catch (error) {
    throw error;
  }
}

export async function updateUser(
  id: number,
  userData: {
    name?: string;
    email?: string;
    password?: string;
    isAdmin?: boolean;
    IsActive?: boolean;  
    groupId?: number | null; 
  }
) {
  try {
    // 1) Clonar y normalizar isActive
    const updateData: any = { ...userData };
    if (Object.prototype.hasOwnProperty.call(updateData, "IsActive")) {
      updateData.isActive = updateData.IsActive; // trasladar
      delete updateData.IsActive;
    }

    // 2) Hashear password si viene
    if (updateData.password) {
      updateData.password = await hashPassword(updateData.password);
    }

    // 3) Preparar payload para Prisma
    const prismaData: any = {
      name: updateData.name,
      email: updateData.email,
      password: updateData.password,
      isActive: updateData.isActive,
      isAdmin: updateData.isAdmin,
      // Importante: manejar la relación correctamente
      ...(Object.prototype.hasOwnProperty.call(userData, "groupId")
        ? {
            group:
              userData.groupId == null
                ? { disconnect: true }     // quitar grupo
                : { connect: { id: userData.groupId } }, // asignar grupo
          }
        : {}),
    };

    const updatedUser = await prisma.user.update({
      where: { id },
      data: prismaData,
      select: { id: true, name: true, email: true, isAdmin: true, IsActive: true, groupId: true }, // no exponemos password
    });

    logInfo(`✅ Usuario actualizado: ${updatedUser.name}`);
    return updatedUser;
  } catch (error: any) {
    // Manejo de errores comunes de Prisma
    if (error.code === "P2002") {
      logInfo(`❌ Email duplicado`);
      throw new Error("El email ya está en uso.");
    }
    if (error.code === "P2025") {
      throw new Error("Usuario no encontrado.");
    }
    logInfo(`❌ Error al actualizar usuario: ${error}`);
    throw error;
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