//controller para grupos
import { Request, Response } from "express";
import {
  getGroupIntegrationById,
  getGroupIntegrations,
  createGroupIntegration,
  updateGroupIntegration,
  deleteGroupIntegration,
} from "../services/groupIntegration.service";
import { logInfo } from "../utils/logger";

//obtener grupo
export const getGroupIntegrationsController = async (
  req: Request,
  res: Response
) => {
  try {
    const groupIntegrations = await getGroupIntegrations();
    res.status(200).json(groupIntegrations);
  } catch (error) {
    logInfo(`❌ Error al obtener grupos: ${error}`);
    res.status(500).json({ error: "Error al obtener grupos" });
  }
};

//obtener grupo por id
export const getGroupIntegrationByIdController = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;
    const groupIntegration = await getGroupIntegrationById(Number(id));
    res.status(200).json(groupIntegration);
  } catch (error) {
    logInfo(`❌ Error al obtener grupo: ${error}`);
    res.status(500).json({ error: "Error al obtener grupo" });
  }
};

//crear grupo
export const createGroupIntegrationController = async (
  req: Request,
  res: Response
) => {
  try {
    const { phoneNumberId, accessTokenId, groupId, Waba_id } = req.body;

    if (!phoneNumberId || !accessTokenId || !groupId || !Waba_id) {
      return res.status(400).json({ error: "Faltan parámetros requeridos" });
    }

    const groupIntegration = await createGroupIntegration(
      phoneNumberId,
      accessTokenId,
      groupId,
      Waba_id
    );

    if (!groupIntegration || (groupIntegration as any).error) {
      return res
        .status(500)
        .json({ error: "Error al crear grupo", details: groupIntegration });
    }

    res.status(201).json(groupIntegration);
  } catch (error) {
    logInfo(`❌ Error al crear grupo: ${error}`);
    res.status(500).json({ error: "Error al crear grupo" });
  }
};

// actualizar grupo
export const updateGroupIntegrationController = async (
  req: Request,
  res: Response
) => {
  try {
    const { id, phoneNumberId, accessTokenId, groupId } = req.body;
    const groupIntegration = await updateGroupIntegration(
      id,
      phoneNumberId,
      accessTokenId,
      groupId
    );
    res.status(200).json(groupIntegration);
  } catch (error) {
    logInfo(`❌ Error al actualizar grupo: ${error}`);
    res.status(500).json({ error: "Error al actualizar grupo" });
  }
};

//eliminar grupo
export const deleteGroupIntegrationController = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;
    const groupIntegration = await deleteGroupIntegration(Number(id));
    res.status(200).json(groupIntegration);
  } catch (error) {
    logInfo(`❌ Error al eliminar grupo: ${error}`);
    res.status(500).json({ error: "Error al eliminar grupo" });
  }
};
