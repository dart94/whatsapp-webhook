import { Router } from 'express';
import { sendTemplate, replyToMessage, getRecentMessages } from '../controllers/message.controller';

const router = Router();

router.post('/message/template', sendTemplate);
router.post('/message/reply', replyToMessage);
router.get('/message/recent', getRecentMessages);

export default router;