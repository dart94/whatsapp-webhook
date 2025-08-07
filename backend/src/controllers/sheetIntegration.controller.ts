import { Request, Response } from "express";
import { registerSheet, listSheets, getSheetById } from "../services/sheetIntegration.service";

//Guardar integración de hoja
export async function handleRegisterSheet(req: Request, res: Response) {
  const { name, spreadsheetId, sheetName } = req.body;

  if (!name || !spreadsheetId || !sheetName) {
    return res.status(400).json({ success: false, message: "Faltan campos requeridos." });
  }

  try {

    const userId = (req as any).user?.id || req.body.userId;
    
    if (!userId) {
      return res.status(401).json({ success: false, message: "Usuario no autenticado." });
    }

    const sheet = await registerSheet({ 
      name, 
      spreadsheetId, 
      sheetName, 
      userId 
    });
    
    res.status(200).json({ success: true, data: sheet });
  } catch (error) {
    console.error("❌ Error registrando hoja:", error);
    res.status(500).json({ success: false, message: "Error al registrar hoja." });
  }
}

// Listar integraciones de hoja
export async function handleListSheets(req: Request, res: Response) {
  const sheets = await listSheets();
  res.status(200).json({ success: true, data: sheets });
}


// Obtener integración de hoja
export async function handleGetSheet(req: Request, res: Response) {
  const { id } = req.params;
  const sheet = await getSheetById(id);
  if (!sheet) {
    return res.status(404).json({ success: false, message: "Hoja no encontrada" });
  }
  res.status(200).json({ success: true, data: sheet });
}
