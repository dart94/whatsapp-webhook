import { API_BASE_URL } from "../config/api";

//Registrar integración de hoja
export async function registerSheet(name: string, spreadsheetId: string, sheetName: string) {
  const response = await fetch(`${API_BASE_URL}/sheetIntegration/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name,
      spreadsheetId,
      sheetName,
    }),
  });
  return response.json();
}

//Listar integraciones de hoja
export async function listSheets() {
  const response = await fetch(`${API_BASE_URL}/sheetIntegration/list`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  return response.json();
}

//Obtener integración de hoja
export async function getSheetById(id: string) {
  const response = await fetch(`${API_BASE_URL}/sheetIntegration/list`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  return response.json();
}

//Obtener encabezados de la hoja
export async function getHeaders(spreadsheetId: string, sheetName: string) {
  const url = new URL(`${API_BASE_URL}/sheets/read`);
  url.searchParams.append('spreadsheetId', spreadsheetId);
  url.searchParams.append('sheetName', sheetName);

  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  console.log(response);

  if (!response.ok) {
    throw new Error(`Error al obtener encabezados: ${response.status}`);
  }

  return response.json();
}