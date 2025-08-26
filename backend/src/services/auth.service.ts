
import { getUserByEmail } from "../services/user.service";
import { logInfo } from "../utils/logger";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { getGroupIntegrationByGroupId } from "./groupIntegration.service";

const jwtSecret = process.env.JWT_SECRET || "defaultSecretKey";

//Función para validar el token y hacer el login
export async function login(email: string, password: string, rememberMe: boolean) {
  try {
    const user = await getUserByEmail(email);
    if (!user) throw new Error("Usuario no encontrado");

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) throw new Error("Contraseña incorrecta");

    //Buscar la integracion del usuario por grupo
    let groupIntegration = null;
    if (user.groupId !== null && user.groupId !== undefined) {
      groupIntegration = await getGroupIntegrationByGroupId(user.groupId);
    }

   const token = jwt.sign(
  { 
    id: user.id, 
    name: user.name, 
    email: user.email, 
    isAdmin: user.isAdmin,
    groupId: user.groupId,
    integration:{
      phoneNumberId: groupIntegration?.phoneNumberId,
      accessTokenId: groupIntegration?.accessTokenId
    }
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
        groupId: user.groupId,
      },
      integration: groupIntegration,
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