import { google } from 'googleapis';
import * as dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

dotenv.config({ path: 'config.env' });

const cScope = ['https://www.googleapis.com/auth/spreadsheets'];

let credentials: any;

if (process.env.NODE_ENV === 'production') {
  if (!process.env.GOOGLE_KEYS) {
    throw new Error('GOOGLE_KEYS no está definida en entorno de producción.');
  }
  credentials = JSON.parse(process.env.GOOGLE_KEYS);
} else {
  const credentialsPath = path.resolve(__dirname, '../../credencialesAI.json');
  if (!fs.existsSync(credentialsPath)) {
    throw new Error(`No se encontró el archivo de credenciales en ${credentialsPath}`);
  }
  credentials = require(credentialsPath);
}

const auth = new google.auth.GoogleAuth({
  credentials,
  scopes: cScope,
});

const sheets = google.sheets({ version: 'v4', auth });

// Obtener encabezados de la hoja (A1:ZZ1)
export const getHeaders = async (spreadsheetId: string, sheetName: string) => {
  const range = `${sheetName}!A1:ZZ1`;
  const result = await sheets.spreadsheets.values.get({ spreadsheetId, range });
  return result.data.values ? result.data.values[0] : [];
};

// Obtener datos del rango completo (ya formado)
export const getData = async (spreadsheetId: string, fullRange: string) => {
  const result = await sheets.spreadsheets.values.get({ spreadsheetId, range: fullRange });
  return result.data.values || [];
};

// Actualizar datos en el rango completo (ya formado)
export const updateData = async (spreadsheetId: string, fullRange: string, values: string[][]) => {
  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: fullRange,
    valueInputOption: 'RAW',
    requestBody: { values },
  });
};
