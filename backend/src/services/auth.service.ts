
import { getUserByEmail } from "../services/user.service";
import { logInfo } from "../utils/logger";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const jwtSecret = process.env.JWT_SECRET || "defaultSecretKey";

export async function login(email: string, password: string, rememberMe: boolean) {
  try {
    const user = await getUserByEmail(email);
    if (!user) throw new Error("Usuario no encontrado");

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) throw new Error("Contraseña incorrecta");

    
   const token = jwt.sign(
  { 
    id: user.id, 
    name: user.name, 
    email: user.email, 
    isAdmin: user.isAdmin 
  },
  jwtSecret,
  { expiresIn: rememberMe ? "7d" : "1d" }
);

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
      },
    };
  } catch (error) {
    logInfo(`❌ Error al iniciar sesión: ${error}`);
    return null;
  }
}

//Validar token
export async function validateToken(token: string) {
try {
  console.log("Token recibido:", token);
  const decoded = jwt.verify(token, jwtSecret);
  console.log("Token decodificado:", decoded);
  return decoded;
} catch (error) {
  console.error("Error al validar token:", error);
  return null;
}
}