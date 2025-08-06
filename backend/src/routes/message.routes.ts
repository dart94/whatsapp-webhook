import { Router } from 'express';
import {
  sendTemplate,
  replyToMessage,
  getRecentMessages,
  markMessagesAsRead,
  getUnreadCounts,
} from '../controllers/message.controller';

import {
  getMessagesByWaidController,
  fetchConversationsController,
} from '../controllers/messagesby.controller';

const router = Router();

/**
 * @swagger
 * /message/template:
 *   post:
 *     summary: Envía una plantilla de mensaje de WhatsApp
 *     tags:
 *       - Mensajes
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
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
 *         description: Plantilla enviada exitosamente
 *       400:
 *         description: Campos faltantes
 *       500:
 *         description: Error interno del servidor
 */
router.post('/message/template', sendTemplate);

/**
 * @swagger
 * /message/reply:
 *   post:
 *     summary: Responde a un mensaje específico de WhatsApp
 *     tags:
 *       - Mensajes
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               to:
 *                 type: string
 *               message:
 *                 type: string
 *     responses:
 *       200:
 *         description: Respuesta enviada correctamente
 *       400:
 *         description: Campos faltantes
 *       500:
 *         description: Error al enviar la respuesta
 */
router.post('/message/reply', replyToMessage);

/**
 * @swagger
 * /message/recent:
 *   get:
 *     summary: Obtiene los 20 mensajes más recientes
 *     tags:
 *       - Mensajes
 *     responses:
 *       200:
 *         description: Lista de mensajes recientes
 *       500:
 *         description: Error al obtener los mensajes
 */
router.get('/message/recent', getRecentMessages);

/**
 * @swagger
 * /messages/{wa_id}:
 *   get:
 *     summary: Obtiene todos los mensajes asociados a un número de WhatsApp
 *     tags:
 *       - Mensajes
 *     parameters:
 *       - in: path
 *         name: wa_id
 *         required: true
 *         schema:
 *           type: string
 *         description: Número de WhatsApp del contacto
 *     responses:
 *       200:
 *         description: Mensajes encontrados exitosamente
 *       400:
 *         description: wa_id faltante
 */
router.get('/messages/:wa_id', getMessagesByWaidController);

/**
 * @swagger
 * /mark-as-read/{waId}:
 *   post:
 *     summary: Marca todos los mensajes entrantes como leídos para un número dado
 *     tags:
 *       - Mensajes
 *     parameters:
 *       - in: path
 *         name: waId
 *         required: true
 *         schema:
 *           type: string
 *         description: Número de WhatsApp (wa_id)
 *     responses:
 *       200:
 *         description: Mensajes marcados como leídos
 *       500:
 *         description: Error al actualizar los mensajes
 */
router.post('/mark-as-read/:waId', markMessagesAsRead);

/**
 * @swagger
 * /unread-counts:
 *   get:
 *     summary: Obtiene el conteo de mensajes no leídos por cada número
 *     tags:
 *       - Mensajes
 *     responses:
 *       200:
 *         description: Conteo de mensajes no leídos por wa_id
 *       500:
 *         description: Error al obtener los conteos
 */
router.get('/unread-counts', getUnreadCounts);

/**
 * @swagger
 * /messages/waid:
 *   get:
 *     summary: Obtiene una lista de conversaciones activas (último mensaje por contacto)
 *     tags:
 *       - Mensajes
 *     responses:
 *       200:
 *         description: Lista de conversaciones activas
 *       500:
 *         description: Error al obtener las conversaciones
 */
router.get('/messages/waid', fetchConversationsController);

export default router;