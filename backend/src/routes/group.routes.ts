//rutas para grupos
import express from "express";
import {
  getGroupByIdController,
  getGroupsController,
  createGroupController,
  updateGroupController,
  deleteGroupController,
} from "../controllers/group.controller";
import { checkAuth } from "../middlewares/auth.middleware";

const router = express.Router();

/**
 * @swagger
 * /groups:
 *   get:
 *     summary: Obtener grupos
 *     description: Obtiene todos los grupos disponibles.
 *     responses:
 *       200:
 *         description: Obtiene todos los grupos disponibles.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Group'
 *       500:
 *         description: Error al obtener grupos.
 */
router.get("/groups", checkAuth, getGroupsController);

/**
 * @swagger
 * /groups:
 *   post:
 *     summary: Crear grupo
 *     description: Crea un nuevo grupo.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Nombre del grupo.
 *             required:
 *               - name
 *     responses:
 *       201:
 *         description: Crea un nuevo grupo.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Group'
 *       400:
 *         description: Falta el nombre del grupo.
 *       500:
 *         description: Error al crear grupo.
 */
router.post("/", checkAuth, createGroupController);

/**
 * @swagger
 * /groups/{id}:
 *   put:
 *     summary: Actualizar grupo
 *     description: Actualiza un grupo existente.
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID del grupo a actualizar.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Nombre del grupo.
 *             required:
 *               - name
 *     responses:
 *       200:
 *         description: Actualiza un grupo existente.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Group'
 *       400:
 *         description: Falta el nombre del grupo.
 *       500:
 *         description: Error al actualizar grupo.
 */
router.put("/:id", checkAuth, updateGroupController);

/**
 * @swagger
 * /groups/{id}:
 *   delete:
 *     summary: Eliminar grupo
 *     description: Elimina un grupo existente.
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID del grupo a eliminar.
 *     responses:
 *       200:
 *         description: Elimina un grupo existente.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Group'
 *       404:
 *         description: Grupo no encontrado.
 *       500:
 *         description: Error al eliminar grupo.
 */
router.delete("/:id", checkAuth, deleteGroupController);

/**
 * @swagger
 * components:
 *   schemas:
 *     Group:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: ID del grupo.
 *         name:
 *           type: string
 *           description: Nombre del grupo.
 */

/**
 * @swagger
 * /groups:
 *   get:
 *     summary: Obtener grupos por ID
 *     description: Obtiene todos los grupos disponibles por su ID.
 *     responses:
 *       200:
 *         description: Obtiene todos los grupos disponibles.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Group'
 *       500:
 *         description: Error al obtener grupos.
 *
 */
router.get("/:id", getGroupByIdController);

export default router;
