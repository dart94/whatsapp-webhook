import { useState, useCallback } from "react";
import { sendTemplateMessage } from "../lib/templates.api";

export function useSendTemplate() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any[]>([]);

  const sendTemplate = useCallback(
    async (
      to: string,
      templateName: string,
      body: string,
      language: string,
      parameters: any[]
    ) => {
      try {
        setLoading(true);
        setError(null);

        const payload = {
          templateName,
          body,
          language,
          messages: [
            {
              to,
              parameters,
            },
          ],
        };
        const data = await sendTemplateMessage(payload);
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