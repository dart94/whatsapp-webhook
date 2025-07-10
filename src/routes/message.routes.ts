import { Router } from 'express';
import { sendTemplate } from '../controllers/message.controller';

const router = Router();

router.post('/message/template', sendTemplate);

export default router;