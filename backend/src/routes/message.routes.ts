import { Router } from 'express';
import {
  sendTemplate,
  replyToMessage,
  getRecentMessages,
  markMessagesAsRead,
  getUnreadCounts,
} from '../controllers/message.controller';

const router = Router();

/**
 * @swagger
 * /message/template:
 *   post:
 *     summary: Enviar mensaje por plantilla
 *     tags:
 *       - Mensajes
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - messages
 *               - templateName
 *               - language
 *               - body
 *             properties:
 *               messages:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     to:
 *                       type: string
 *                     parameters:
 *                       type: array
 *                       items:
 *                         type: string
 *               templateName:
 *                 type: string
 *               language:
 *                 type: string
 *               body:
 *                 type: string
 *     responses:
 *       200:
 *         description: Plantillas enviadas exitosamente
 *       400:
 *         description: Campos requeridos faltantes
 *       500:
 *         description: Error en el envío de plantilla
 */
router.post('/message/template', sendTemplate);

/**
 * @swagger
 * /message/reply:
 *   post:
 *     summary: Responder a un mensaje recibido
 *     tags:
 *       - Mensajes
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - to
 *               - message
 *             properties:
 *               to:
 *                 type: string
 *               message:
 *                 type: string
 *     responses:
 *       200:
 *         description: Respuesta enviada
 *       400:
 *         description: Campos requeridos faltantes
 *       500:
 *         description: Error al enviar respuesta
 */
router.post('/message/reply', replyToMessage);

/**
 * @swagger
 * /message/recent:
 *   get:
 *     summary: Obtener los últimos 20 mensajes recientes
 *     tags:
 *       - Mensajes
 *     responses:
 *       200:
 *         description: Lista de mensajes recientes
 *       500:
 *         description: Error al obtener mensajes
 */
router.get('/message/recent', getRecentMessages);

/**
 * @swagger
 * /mark-as-read/{waId}:
 *   post:
 *     summary: Marcar como leídos los mensajes entrantes de un contacto
 *     tags:
 *       - Mensajes
 *     parameters:
 *       - in: path
 *         name: waId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de WhatsApp del contacto
 *     responses:
 *       200:
 *         description: Mensajes marcados como leídos
 *       500:
 *         description: Error al marcar mensajes
 */
router.post('/mark-as-read/:waId', markMessagesAsRead);

/**
 * @swagger
 * /unread-counts:
 *   get:
 *     summary: Obtener conteo de mensajes no leídos por conversación
 *     tags:
 *       - Mensajes
 *     responses:
 *       200:
 *         description: Conteo de no leídos por contacto
 *       500:
 *         description: Error al obtener conteos
 */
router.get('/unread-counts', getUnreadCounts);

export default router;
