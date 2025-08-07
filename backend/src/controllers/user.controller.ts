import { Request, Response } from "express";
import { getUsers, getUserById, createUser, updateUser, deleteUser } from "../services/user.service";
import { validateUserInputFull } from "../validators/userInput.validator";
import { logInfo } from "../utils/logger";

//Obtener usuarios
export const getUsersController = async (req: Request, res: Response) => {
  try {
    const users = await getUsers();
    res.status(200).json({ success: true, data: users });
  } catch (error) {
    logInfo(`❌ Error al obtener usuarios: ${error}`);
    res.status(500).json({ success: false, message: "Error al obtener usuarios." });
  }
};

//Obtener usuario por ID
export const getUserByIdController = async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ success: false, message: "Falta el parámetro id." });
  }

  try {
    const user = await getUserById(Number(id)); 
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    logInfo(`❌ Error al obtener usuario: ${error}`);
    res.status(500).json({ success: false, message: "Error al obtener usuario." });
  }
};

//Crear nuevo usuario
export const createUserController = async (req: Request, res: Response) => {
  const { name, email, password, isAdmin, isActive } = req.body;

  const validationErrors = validateUserInputFull({ name, email, password });
if (validationErrors.length > 0) {
  return res.status(400).json({ success: false, errors: validationErrors });
}

  try {
    const user = await createUser({ name, email, password, isAdmin, isActive });
    res.status(201).json({ success: true, data: user });
  } catch (error: any) {
    logInfo(`❌ Error al crear usuario: ${error.message}`);
    res.status(500).json({ success: false, message: error.message });
  }
};

//Actualizar usuario
export const updateUserController = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, email, password, isAdmin, isActive } = req.body;

  if (!id || !name || !email || !password) {
    return res.status(400).json({ success: false, message: "Faltan parámetros o campos requeridos." });
  }

  try {
    const user = await updateUser(Number(id), { name, email, password, isAdmin, isActive });
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    logInfo(`❌ Error al actualizar usuario: ${error}`);
    res.status(500).json({ success: false, message: "Error al actualizar usuario." });
  }
};

//Eliminar usuario
export const deleteUserController = async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ success: false, message: "Falta el parámetro id." });
  }

  try {
    const user = await deleteUser(Number(id));
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    logInfo(`❌ Error al eliminar usuario: ${error}`);
    res.status(500).json({ success: false, message: "Error al eliminar usuario." });
  }
};