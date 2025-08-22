// middlewares/auth.middleware.ts
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

// Tipo para el payload que esperamos del JWT
interface JwtPayload {
  id: string;
  isAdmin: boolean;
  iat: number;
  exp: number;
}

// Middleware para verificar token (cualquiera que esté logueado)
export const checkAuth = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ success: false, message: "Token requerido" });
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({ success: false, message: "Token mal formado" });
  }

  try {
    const jwtSecret = process.env.JWT_SECRET || "defaultSecretKey";
    const decoded = jwt.verify(token, jwtSecret) as JwtPayload;

    // Guardamos el payload en req.user para usarlo en rutas protegidas
    (req as any).user = {
      id: decoded.id,
      isAdmin: decoded.isAdmin
    };

    next();
  } catch (error: any) {
    console.error("JWT verification error:", error.message);
    return res.status(401).json({ success: false, message: "Token inválido o expirado" });
  }
};

// Middleware para rutas que requieren admin
export const checkAdmin = (req: Request, res: Response, next: NextFunction) => {
  // Primero verificamos que esté autenticado
  checkAuth(req, res, () => {
    const user = (req as any).user;
    if (!user.isAdmin) {
      return res.status(403).json({ success: false, message: "Acceso denegado: solo admin" });
    }
    next();
  });
};
