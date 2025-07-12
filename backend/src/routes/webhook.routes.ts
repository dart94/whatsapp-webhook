import express from 'express';
import { verifyWebhook, handleWebhookEvent } from '../controllers/webhook.controller';

const router = express.Router();

/**
 * GET /webhook
 * Meta Webhook Verification
 */
router.get('/', verifyWebhook);

/**
 * POST /webhook
 * WhatsApp sends real events to this endpoint
 */
router.post('/', handleWebhookEvent);

export default router;
