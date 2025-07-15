import { useState, useCallback } from "react";
import { sendTemplateMessage } from "../lib/templates.api";
import { Template } from "../types/whatsapp";

export function useSendTemplate() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any[]>([]);

  const sendTemplate = useCallback(
    async (to: string, templateName: string, language: string, parameters: any[]) => {
      try {
        setLoading(true);
        setError(null);
        const data = await sendTemplateMessage(to, templateName, language, parameters);
        setResult(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Error al enviar la plantilla"
        );
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { sendTemplate, loading, error, result };
}