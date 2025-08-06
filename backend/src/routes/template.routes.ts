import { Router } from 'express';
import { getTemplates } from '../controllers/template.controller';

const router = Router();

/**
 * @swagger
 * /templates:
 *   get:
 *     summary: Obtener plantillas de WhatsApp
 *     tags:
 *       - Plantillas
 *     responses:
 *       200:
 *         description: Lista de plantillas obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       name:
 *                         type: string
 *                       language:
 *                         type: string
 *                       status:
 *                         type: string
 *                       category:
 *                         type: string
 *                       header:
 *                         type: string
 *                         nullable: true
 *                       body:
 *                         type: string
 *                         nullable: true
 *                       footer:
 *                         type: string
 *                         nullable: true
 *                       buttons:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             type:
 *                               type: string
 *                             text:
 *                               type: string
 *       500:
 *         description: Error al obtener plantillas de WhatsApp
 */
router.get('/', getTemplates);

export default router;
