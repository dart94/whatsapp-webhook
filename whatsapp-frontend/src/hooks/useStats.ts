import { useEffect, useState } from "react";
import { TemplateStatsResult } from "../types/stats";
import { fetchAllTemplateMessages } from "../lib/stats";

export function useStats(token: string | null) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<TemplateStatsResult | null>(null);

  useEffect(() => {
    if (!token) return;

    (async () => {
      try {
        setLoading(true);
        setError(null);

        const data = await fetchAllTemplateMessages(token);
        setData(data);
      } catch (e) {
        console.error("Error al cargar estadísticas:", e);
        setError(e instanceof Error ? e.message : "Ocurrió un error al cargar estadísticas");
      } finally {
        setLoading(false);
      }
    })();
  }, [token]);

  return { loading, error, data };
}
