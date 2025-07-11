import { Router } from 'express';
import { sendTemplate, replyToMessage } from '../controllers/message.controller';

const router = Router();

router.post('/message/template', sendTemplate);
router.post('/message/reply', replyToMessage);

export default router;