// middlewares/checkAuth.ts
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
const jwtSecret = process.env.JWT_SECRET || "defaultSecretKey";

export function checkAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ") ? authHeader.split(" ")[1] : undefined;

  if (!token) return res.status(401).json({ success: false, message: "Token requerido" });

  try {
    const decoded = jwt.verify(token, jwtSecret) as { id: number; isAdmin: boolean };
    (req as any).user = decoded;
    next();
  } catch {
    return res.status(401).json({ success: false, message: "Token inválido" });
  }
}
