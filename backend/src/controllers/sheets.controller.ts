import { Request, Response } from 'express';
import { getHeaders, getData } from '../services/sheets.service';

// Controlador para obtener encabezados y datos dinámicamente
export const leerDatosDesdeSheet = async (req: Request, res: Response) => {
  const { spreadsheetId, sheetName, range } = req.query;

  if (!spreadsheetId || !sheetName) {
    return res.status(400).json({
      success: false,
      message: 'Faltan parámetros requeridos: spreadsheetId y sheetName',
    });
  }

  try {
    // Si se proporciona un rango específico, usamos getData
    if (range) {
      const fullRange = `${sheetName}!${range}`;
      const values = await getData(spreadsheetId as string, fullRange);

      return res.status(200).json({
        success: true,
        data: values,
      });
    }

    // Si no se proporciona rango, obtenemos headers y luego todos los datos
    const headers = await getHeaders(spreadsheetId as string, sheetName as string);
    const fullRange = `${sheetName}!A2:ZZ`; // Datos debajo del header
    const values = await getData(spreadsheetId as string, fullRange);

    const dataAsObjects = values.map((row) => {
      const obj: Record<string, string> = {};
      headers.forEach((header, i) => {
        obj[header] = row[i] || "";
      });
      return obj;
    });

    return res.status(200).json({
      success: true,
      headers,
      data: dataAsObjects,
    });
  } catch (error: any) {
    console.error("❌ Error al leer Google Sheets:", error.message);
    return res.status(500).json({
      success: false,
      message: 'Error al leer datos de Google Sheets',
      error: error.message,
    });
  }
};
