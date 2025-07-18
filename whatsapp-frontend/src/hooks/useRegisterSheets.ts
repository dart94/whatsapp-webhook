import { useEffect, useState } from "react";
import { registerSheet } from "../lib/sheet.api";
import { API_BASE_URL } from "../config/api";

export function useSheetIntegrations() {
  const [sheets, setSheets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSheets = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/sheetIntegration/list`);
      const data = await response.json();
      
      if (data.success) {
        setSheets(data.data);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Error al cargar las hojas');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const registerSheet = async (name: string, spreadsheetId: string, sheetName: string) => {
    try {
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
      
      const data = await response.json();
      
      if (data.success) {
        // Actualizar la lista después de registrar
        await fetchSheets();
        return data.data;
      } else {
        throw new Error(data.message);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al registrar la hoja');
      throw err;
    }
  };

  useEffect(() => {
    fetchSheets();
  }, []);

  return { 
    sheets, 
    loading, 
    error, 
    registerSheet, 
    refetch: fetchSheets 
  };
}