import { Router } from "express";
import { getUniqueWaidsController } from "../controllers/waid.controller";

const router = Router();

/**
 * @swagger
 * /waid:
 *   get:
 *     summary: Obtener WAIDs únicos con su último mensaje
 *     tags:
 *       - WAIDs
 *     responses:
 *       200:
 *         description: Lista de WAIDs obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       wa_id:
 *                         type: string
 *                       message_id:
 *                         type: string
 *                         nullable: true
 *                       body_text:
 *                         type: string
 *                         nullable: true
 *                       direction:
 *                         type: string
 *                         enum: [IN, OUT]
 *                       timestamp:
 *                         type: integer
 *                       read:
 *                         type: boolean
 *                         example: false
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                       unreadCount:
 *                         type: integer
 *                         example: 1
 *       500:
 *         description: Error al obtener WAIDs únicos
 */
router.get("/", getUniqueWaidsController);

export default router;
