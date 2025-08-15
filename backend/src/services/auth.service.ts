//Login
import { getUserByEmail } from "../services/user.service";
import { logInfo } from "../utils/logger";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const jwtSecret = process.env.JWT_SECRET || "defaultSecretKey";

//Login
export async function login(email: string, password: string, rememberMe: boolean, isAdmin: boolean) {
  try {
    const user = await getUserByEmail(email);
    if (!user) {
      throw new Error("Usuario no encontrado");
    }
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      throw new Error("Contraseña incorrecta");
    }
    //Enviar isAdmin para verificar si el usuario tiene permisos de admin
    if (isAdmin && !user.isAdmin) {
      throw new Error("No tienes permisos de admin");
    }
    const token = jwt.sign({ id: user.id }, jwtSecret);
    return { token, user };
  } catch (error) {
    logInfo(`❌ Error al iniciar sesión: ${error}`);
    return null;
  }
}

//Validar token
export async function validateToken(token: string) {
  try {
    const decoded = jwt.verify(token, jwtSecret);
    return decoded;
  } catch (error) {
    logInfo(`❌ Error al validar token: ${error}`);
    return null;
  }
}