//rutas para grupos
import express from "express";
import {
  getGroupIntegrationsController,
  getGroupIntegrationByIdController,
  createGroupIntegrationController,
  updateGroupIntegrationController,
  deleteGroupIntegrationController,
} from "../controllers/groupIntegration.controller";

const router = express.Router();

//Obtener grupos
/**
* @swagger
* /groupIntegration:
*   get:
*     description: Obtener grupos
*     tags:
*       - groupIntegration
*     responses:
*       200:
*         description: Obtener grupos
*         content:
*           application/json:
*             schema:
*               type: array
*               items:
*                 $ref: '#/components/schemas/GroupIntegration'
*       500:
*         description: Error al obtener grupos
*/
router.get("/", getGroupIntegrationsController);

//Obtener grupo por id
/**
* @swagger
* /groupIntegration/{id}:
*   get:
*     description: Obtener grupo por id
*     tags:
*       - groupIntegration
*     parameters:
*       - name: id
*         in: path
*         description: ID del grupo
*         required: true
*         schema:
*           type: number
*     responses:
*       200:
*         description: Obtener grupo por id
*         content:
*           application/json:
*             schema:
*               $ref: '#/components/schemas/GroupIntegration'
*       500:
*         description: Error al obtener grupo
*/  
router.get("/:id", getGroupIntegrationByIdController);

//Crear grupo
/**
* @swagger
* /groupIntegration:
*   post:
*     description: Crear grupo
*     tags:
*       - groupIntegration
*     requestBody:
*       required: true
*       content:
*         application/json:
*           schema:
*             type: object
*             properties:
*               phoneNumberId:
*                 type: number
*               accessTokenId:
*                 type: string
*               groupId:
*                 type: number
*     responses:
*       201:
*         description: Crear grupo
*         content:
*           application/json:
*             schema:
*               $ref: '#/components/schemas/GroupIntegration'
*       500:
*         description: Error al crear grupo 
*/
router.post("/", createGroupIntegrationController);

// Actualizar grupo
/**
* @swagger
* /groupIntegration/{id}:
*   put:
*     description: Actualizar grupo
*     tags:
*       - groupIntegration
*     parameters:
*       - name: id
*         in: path
*         description: ID del grupo
*         required: true
*         schema:
*           type: number
*     requestBody:
*       required: true
*       content:
*         application/json:
*           schema:
*             type: object
*             properties:
*               phoneNumberId:
*                 type: number
*               accessTokenId:
*                 type: string
*               groupId:
*                 type: number
*     responses:
*       200:
*         description: Actualizar grupo
*         content:
*           application/json:
*             schema:
*               $ref: '#/components/schemas/GroupIntegration'
*       500:
*         description: Error al actualizar grupo
*/
router.put("/:id", updateGroupIntegrationController);

//Eliminar grupo
/**
* @swagger
* /groupIntegration/{id}:
*   delete:
*     description: Eliminar grupo
*     tags:
*       - groupIntegration
*     parameters:
*       - name: id
*         in: path
*         description: ID del grupo
*         required: true
*         schema:
*           type: number
*     responses:
*       200:
*         description: Eliminar grupo
*         content:
*           application/json:
*             schema:
*               $ref: '#/components/schemas/GroupIntegration'
*       500:
*         description: Error al eliminar grupo
* 
* 
*/
 router.delete("/:id", deleteGroupIntegrationController);

export default router;