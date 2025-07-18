// types/sheet.ts
export interface RegisteredSheet {
  id: string;
  name: string;
  spreadsheetId: string;
  sheetName: string;
  headers: string[];
  createdAt: string;
  updatedAt: string;
}
