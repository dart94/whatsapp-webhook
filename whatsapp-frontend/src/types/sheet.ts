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

export interface SheetRowData {
  [key: string]: string | number | undefined;
  Celular?: string;
  Whatsapp?: string;
  Telefono?: string;
  Nombre?: string;
  Name?: string;
}

export interface RecipientData {
  id: string;
  name: string;
  phone: string;
  variables: string[];
  status: "pending" | "sending" | "sent" | "error";
  error?: string;
  originalRowIndex: number;
}
