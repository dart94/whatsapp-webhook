import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export const checkAdmin = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ success: false, message: "Token requerido" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string, isAdmin: boolean };
    if (!decoded.isAdmin) {
      return res.status(403).json({ success: false, message: "Acceso denegado" });
    }
    (req as any).user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: "Token inválido" });
  }
};
