import { Router } from 'express';
import { leerDatosDesdeSheet } from '../controllers/sheets.controller';

const router = Router();

/**
 * @swagger
 * /sheets/read:
 *   get:
 *     summary: Leer datos de una hoja de cálculo de Google Sheets
 *     tags:
 *       - Google Sheets
 *     parameters:
 *       - in: query
 *         name: spreadsheetId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del documento de Google Sheets
 *       - in: query
 *         name: sheetName
 *         required: true
 *         schema:
 *           type: string
 *         description: Nombre de la hoja dentro del spreadsheet
 *       - in: query
 *         name: range
 *         required: false
 *         schema:
 *           type: string
 *         description: Rango personalizado (ej: "A1:B10"). Si se omite, se obtienen los headers y todas las filas.
 *     responses:
 *       200:
 *         description: Datos obtenidos exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 headers:
 *                   type: array
 *                   items:
 *                     type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                 totalRows:
 *                   type: number
 *       400:
 *         description: Faltan parámetros requeridos
 *       404:
 *         description: No se encontraron encabezados en la hoja
 *       500:
 *         description: Error al leer datos de Google Sheets
 */
router.get('/sheets/read', leerDatosDesdeSheet);

export default router;
