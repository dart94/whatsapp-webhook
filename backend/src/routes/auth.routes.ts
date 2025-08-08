import { Router } from "express";
import { loginController, validateTokenController } from "../controllers/auth.controller";

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

/**
 * @swagger
 * /auth/validateToken:
 *   post:
 *     summary: Validar token
 *     tags:
 *       - Autenticación
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               token:
 *                 type: string
 *                 example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjEyMzQ1Njc4OTAiLCJpYXQiOjE2MzA3NDU5OTIsImV4cCI6MTYzMDc0NTk5Mn0.3-9r7-4-8-3-2-1-0-1-0-1-0-0-0-0-0-0-0
 *     responses:
 *       200:
 *         description: Datos de validación de token exitosamente
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
 *                     id:
 *                       type: string
 *                     name:
 *                       type: string
 *                     email:
 *                       type: string
 *                     isAdmin:
 *                       type: boolean
 *                     IsActive:
 *                       type: boolean
 *       400:
 *         description: Falta el token
 *       401:
 *         description: Token inválido
 *       500:
 *         description: Error al validar token
 */
router.post("/validateToken", validateTokenController);

export default router;