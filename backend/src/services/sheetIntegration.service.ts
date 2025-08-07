import { PrismaClient } from "@prisma/client";
import { getHeaders } from "./sheets.service";

const prisma = new PrismaClient();

//Guardar integración de hoja
export async function registerSheet({
  name,
  spreadsheetId,
  sheetName,
  userId,
}: {
  name: string;
  spreadsheetId: string;
  sheetName: string;
  userId: number;
}) {
  const headers = await getHeaders(spreadsheetId, sheetName);
  return prisma.sheetIntegration.create({ 
    data: {
      name,
      spreadsheetId,
      sheetName,
      headers,
      userId,
    },
  });
}

export async function listSheets() {
  return prisma.sheetIntegration.findMany({  //
    orderBy: { createdAt: "desc" },
  });
}

// Obtener integración de hoja
export async function getSheetById(id: string) {
  return prisma.sheetIntegration.findUnique({ where: { id } });  // 
}