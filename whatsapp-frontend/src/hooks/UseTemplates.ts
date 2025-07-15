import { useState, useEffect, useCallback } from "react";
import { fetchTemplates } from "../lib/templates.api";
import { Template } from "../types/whatsapp";

export function useTemplates() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadTemplates = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchTemplates();
      setTemplates(data);
      setLoading(false);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al cargar las plantillas"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTemplates();
  }, [loadTemplates]);

  return { templates, loading, error };
}
