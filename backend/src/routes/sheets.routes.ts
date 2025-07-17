import { Router } from 'express';
import { leerDatosDesdeSheet } from '../controllers/sheets.controller';

const router = Router();

router.get('/sheets/read', leerDatosDesdeSheet);

export default router;