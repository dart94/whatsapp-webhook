import { Router } from 'express';
import { sendTemplate, replyToMessage, getRecentMessages } from '../controllers/message.controller';
import {getMessagesByWaidController} from '../controllers/messagesby.controller';

const router = Router();

router.post('/message/template', sendTemplate);
router.post('/message/reply', replyToMessage);
router.get('/message/recent', getRecentMessages);
router.get("/messages/:wa_id", getMessagesByWaidController);


export default router;