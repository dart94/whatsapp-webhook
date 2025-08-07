import { Router } from "express";
import { loginController } from "../controllers/auth.controller";

const router = Router();

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Iniciar sesión
 *     tags:
 *       - Autenticación
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: diego@gmail.com
 *               password:
 *                 type: string
 *                 example: 12345678
 *     responses:
 *       200:
 *         description: Datos de inicio de sesión exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     token:
 *                       type: string
 *                     user:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                         name:
 *                           type: string
 *                         email:
 *                           type: string
 *                         isAdmin:
 *                           type: boolean
 *                         IsActive:
 *                           type: boolean
 *       400:
 *         description: Faltan parámetros o campos requeridos
 *       401:
 *         description: Credenciales inválidas
 *       500:
 *         description: Error al iniciar sesión
 */
router.post("/login", loginController);

export default router;