//Login
import { getUserByEmail } from "../services/user.service";
import { logInfo } from "../utils/logger";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const jwtSecret = process.env.JWT_SECRET || "defaultSecretKey";


export async function login(email: string, password: string) {
  try {
    const user = await getUserByEmail(email);
    if (!user) {
      throw new Error("Usuario no encontrado");
    }
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      throw new Error("Contraseña incorrecta");
    }
    const token = jwt.sign({ id: user.id }, jwtSecret);
    return { token, user };
  } catch (error) {
    logInfo(`❌ Error al iniciar sesión: ${error}`);
    return null;
  }
}