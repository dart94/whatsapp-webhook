import { Router } from 'express';
import { getTemplates } from '../controllers/template.controller';

const router = Router();

router.get('/templates', getTemplates);

export default router;