import { Request, Response } from "express";
import { login } from "../services/auth.service";

//Login
export const loginController = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: "Faltan parámetros o campos requeridos." });
  }

  try {
    const result = await login(email, password);
    if (!result) {
      return res.status(401).json({ success: false, message: "Credenciales inválidas." });
    }
    const { token, user } = result;
    res.status(200).json({ success: true, data: { token, user } });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error al iniciar sesión." });
  }
};