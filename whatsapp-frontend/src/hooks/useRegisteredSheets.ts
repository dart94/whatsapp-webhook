import { useState, useEffect } from 'react';
import { RegisteredSheet } from "@/types/sheet";

export function useRegisteredSheets() {
  const [sheets, setSheets] = useState<RegisteredSheet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSheets = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/sheetIntegration/list`);
        const data = await response.json();
        if (data.success) {
          setSheets(data.data);
        } else {
          setError(data.message);
        }
      } catch (err) {
        setError("Error al cargar hojas");
      } finally {
        setLoading(false);
      }
    };

    fetchSheets();
  }, []);

  return { sheets, loading, error };
}