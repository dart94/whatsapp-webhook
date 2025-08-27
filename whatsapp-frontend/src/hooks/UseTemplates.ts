import { useState, useEffect, useCallback } from "react";
import { fetchTemplates } from "../lib/templates.api";
import { Template } from "../types/whatsapp";

export function useTemplates(token: string | null) {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadTemplates = useCallback(async () => {
    if (!token) {
      setError("No hay token disponible");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const data = await fetchTemplates(token); // 🔹 ahora pasamos el token
      setTemplates(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al cargar las plantillas"
      );
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadTemplates();
  }, [loadTemplates]);

  return { templates, loading, error, reload: loadTemplates };
}
