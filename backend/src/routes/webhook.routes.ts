import express from 'express';
import { verifyWebhook, handleWebhookEvent } from '../controllers/webhook.controller';

const router = express.Router();

/**
 * @swagger
 * /webhook:
 *   get:
 *     summary: Verificación del Webhook de Meta
 *     description: Endpoint que Meta utiliza para verificar el webhook mediante un token.
 *     parameters:
 *       - in: query
 *         name: 'hub.mode'
 *         schema:
 *           type: string
 *         required: true
 *         description: Modo de verificación (debe ser 'subscribe')
 *       - in: query
 *         name: 'hub.verify_token'
 *         schema:
 *           type: string
 *         required: true
 *         description: Token de verificación definido por el servidor
 *       - in: query
 *         name: 'hub.challenge'
 *         schema:
 *           type: string
 *         required: true
 *         description: Código de desafío que debe devolverse si el token es válido
 *     responses:
 *       200:
 *         description: Verificación exitosa
 *       403:
 *         description: Token inválido
 */
router.get('/', verifyWebhook);

/**
 * @swagger
 * /webhook:
 *   post:
 *     summary: Recepción de eventos de WhatsApp
 *     description: Este endpoint recibe eventos en tiempo real enviados por WhatsApp Cloud API.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             example:
 *               object: "whatsapp_business_account"
 *               entry:
 *                 - id: "WHATSAPP_BUSINESS_ACCOUNT_ID"
 *                   changes:
 *                     - value:
 *                         messaging_product: "whatsapp"
 *                         metadata:
 *                           display_phone_number: "PHONE_NUMBER"
 *                           phone_number_id: "PHONE_NUMBER_ID"
 *                         contacts:
 *                           - profile:
 *                               name: "John Doe"
 *                             wa_id: "1234567890"
 *                         messages:
 *                           - from: "1234567890"
 *                             id: "wamid.ID"
 *                             timestamp: "TIMESTAMP"
 *                             text:
 *                               body: "Hola"
 *                             type: "text"
 *                       field: "messages"
 *     responses:
 *       200:
 *         description: Evento procesado exitosamente
 *       500:
 *         description: Error al procesar el evento
 */
router.post('/', handleWebhookEvent);

export default router;
