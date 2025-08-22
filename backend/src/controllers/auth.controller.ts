import { Request, Response } from "express";
import { login, validateToken } from "../services/auth.service";

interface LoginResult {
  token: string;
  user: any; 
}

export const loginController = async (req: Request, res: Response) => {
  const { email, password, rememberMe } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "Faltan parámetros o campos requeridos."
    });
  }

  try {
    // 
    const result: LoginResult | null = await login(email, password, rememberMe);

    if (!result) {
      return res.status(401).json({
        success: false,
        message: "Credenciales inválidas."
      });
    }

    const { token, user } = result;

    res.status(200).json({
      success: true,
      data: { token, user }
    });

  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Error interno al iniciar sesión."
    });
  }
};


//Validar token
export const validateTokenController = async (req: Request, res: Response) => {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({
      success: false,
      message: "Falta el token."
    });
  }

  try {
    const decoded = await validateToken(token);

    if (!decoded) {
      return res.status(401).json({
        success: false,
        message: "Token inválido."
      });
    }

    res.status(200).json({
      success: true,
      data: decoded
    });

  } catch (error) {
    console.error("Validate token error:", error);
    res.status(500).json({
      success: false,
      message: "Error interno al validar token."
    });
  }
};