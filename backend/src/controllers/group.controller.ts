//Controller para grupos
import { Request, Response } from "express";
import { getGroups, getGroupById, createGroup, updateGroup, deleteGroup } from "../services/group.service";
import { validateGroupInputFull } from "../validators/groupInput.validator";
import { logInfo } from "../utils/logger";

//Obtener grupos
export const getGroupsController = async (req: Request, res: Response) => {
  try {
    const groups = await getGroups();
    res.status(200).json({ success: true, data: groups });
  } catch (error) {
    logInfo(`❌ Error al obtener grupos: ${error}`);
    res.status(500).json({ success: false, message: "Error al obtener grupos." });
  }
};

//Obtener grupo por ID
export const getGroupByIdController = async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ success: false, message: "Falta el parámetro id." });
  }

  try {
    const group = await getGroupById(Number(id));
    res.status(200).json({ success: true, data: group });
  } catch (error) {
    logInfo(`❌ Error al obtener grupo: ${error}`);
    res.status(500).json({ success: false, message: "Error al obtener grupo." });
  }
};

//Crear nuevo grupo
export const createGroupController = async (req: Request, res: Response) => {
  const { name } = req.body;

  const validationErrors = validateGroupInputFull({ name });
if (validationErrors.length > 0) {
  return res.status(400).json({ success: false, errors: validationErrors });
}

  try {
    const group = await createGroup({ name });
    res.status(201).json({ success: true, data: group });
  } catch (error: any) {
    logInfo(`❌ Error al crear grupo: ${error.message}`);
    res.status(500).json({ success: false, message: error.message });
  }
};

//Actualizar grupo
export const updateGroupController = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name } = req.body;

  if (!id || !name) {
    return res.status(400).json({ success: false, message: "Faltan parámetros o campos requeridos." });
  }

  try {
    const group = await updateGroup(Number(id), { name });
    res.status(200).json({ success: true, data: group });
  } catch (error) {
    logInfo(`❌ Error al actualizar grupo: ${error}`);
    res.status(500).json({ success: false, message: "Error al actualizar grupo." });
  }
};

//Eliminar grupo
export const deleteGroupController = async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ success: false, message: "Falta el parámetro id." });
  }

  try {
    const group = await deleteGroup(Number(id));
    res.status(200).json({ success: true, data: group });
  } catch (error) {
    logInfo(`❌ Error al eliminar grupo: ${error}`);
    res.status(500).json({ success: false, message: "Error al eliminar grupo." });
  }
};