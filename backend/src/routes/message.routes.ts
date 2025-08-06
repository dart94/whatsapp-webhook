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
 *     summary: Envía una plantilla de mensaje
 *     tags:
 *       - Mensajes
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               templateId:
 *                 type: string
 *               to:
 *                 type: string
 *     responses:
 *       200:
 *         description: Plantilla enviada exitosamente
 */
router.post('/message/template', sendTemplate);

/**
 * @swagger
 * /message/reply:
 *   post:
 *     summary: Responde a un mensaje específico
 *     tags:
 *       - Mensajes
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               message:
 *                 type: string
 *               replyTo:
 *                 type: string
 *     responses:
 *       200:
 *         description: Respuesta enviada
 */
router.post('/message/reply', replyToMessage);

/**
 * @swagger
 * /message/recent:
 *   get:
 *     summary: Obtiene los mensajes recientes
 *     tags:
 *       - Mensajes
 *     responses:
 *       200:
 *         description: Lista de mensajes recientes
 */
router.get('/message/recent', getRecentMessages);

/**
 * @swagger
 * /messages/{wa_id}:
 *   get:
 *     summary: Obtener mensajes por wa_id
 *     tags:
 *       - Mensajes
 *     parameters:
 *       - in: path
 *         name: wa_id
 *         required: true
 *         schema:
 *           type: string
 *         description: WhatsApp ID del contacto
 *     responses:
 *       200:
 *         description: Mensajes encontrados
 */
router.get('/messages/:wa_id', getMessagesByWaidController);

/**
 * @swagger
 * /mark-as-read/{waId}:
 *   post:
 *     summary: Marcar mensajes como leídos para un número
 *     tags:
 *       - Mensajes
 *     parameters:
 *       - in: path
 *         name: waId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de WhatsApp
 *     responses:
 *       200:
 *         description: Mensajes marcados como leídos
 */
router.post('/mark-as-read/:waId', markMessagesAsRead);

/**
 * @swagger
 * /unread-counts:
 *   get:
 *     summary: Obtiene conteo de mensajes no leídos por usuario
 *     tags:
 *       - Mensajes
 *     responses:
 *       200:
 *         description: Conteos por contacto
 */
router.get('/unread-counts', getUnreadCounts);

/**
 * @swagger
 * /messages/waid:
 *   get:
 *     summary: Obtiene conversaciones activas
 *     tags:
 *       - Mensajes
 *     responses:
 *       200:
 *         description: Conversaciones activas
 */
router.get('/messages/waid', fetchConversationsController);

export default router;
