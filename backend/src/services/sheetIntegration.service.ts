import { PrismaClient } from "@prisma/client";
import { getHeaders } from "./sheets.service";

const prisma = new PrismaClient();

export async function registerSheet({
  name,
  spreadsheetId,
  sheetName,
}: {
  name: string;
  spreadsheetId: string;
  sheetName: string;
}) {
  const headers = await getHeaders(spreadsheetId, sheetName);
  return prisma.sheetIntegration.create({ 
    data: {
      name,
      spreadsheetId,
      sheetName,
      headers,
    },
  });
}

export async function listSheets() {
  return prisma.sheetIntegration.findMany({  //
    orderBy: { createdAt: "desc" },
  });
}

export async function getSheetById(id: string) {
  return prisma.sheetIntegration.findUnique({ where: { id } });  // 
}