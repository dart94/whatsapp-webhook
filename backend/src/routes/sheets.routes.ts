import { Router } from 'express';
import { leerDatosDesdeSheet } from '../controllers/sheets.controller';

const router = Router();

router.get('/read', leerDatosDesdeSheet);

export default router;