import { Router } from "express";
import {
  handleRegisterSheet,
  handleListSheets,
  handleGetSheet,
} from "../controllers/sheetIntegration.controller";

const router = Router();

/**
 * @swagger
 * /sheetIntegration/register:
 *   post:
 *     summary: Registrar una nueva hoja de cálculo
 *     tags:
 *       - Integración de Hojas
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - spreadsheetId
 *               - sheetName
 *             properties:
 *               name:
 *                 type: string
 *                 example: Registro de Clientes
 *               spreadsheetId:
 *                 type: string
 *                 example: 1aBcD1234EfG5678Hijk
 *               sheetName:
 *                 type: string
 *                 example: Hoja1
 *     responses:
 *       200:
 *         description: Hoja registrada exitosamente
 *       400:
 *         description: Faltan campos requeridos
 *       500:
 *         description: Error al registrar hoja
 */
router.post("/register", handleRegisterSheet);

/**
 * @swagger
 * /sheetIntegration/list:
 *   get:
 *     summary: Listar todas las integraciones de hojas
 *     tags:
 *       - Integración de Hojas
 *     responses:
 *       200:
 *         description: Lista de hojas integradas
 *       500:
 *         description: Error al obtener la lista
 */
router.get("/list", handleListSheets);

/**
 * @swagger
 * /sheetIntegration/{id}:
 *   get:
 *     summary: Obtener información de una hoja por ID
 *     tags:
 *       - Integración de Hojas
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la hoja registrada
 *     responses:
 *       200:
 *         description: Datos de la hoja
 *       404:
 *         description: Hoja no encontrada
 *       500:
 *         description: Error al obtener la hoja
 */
router.get("/:id", handleGetSheet);

export default router;
