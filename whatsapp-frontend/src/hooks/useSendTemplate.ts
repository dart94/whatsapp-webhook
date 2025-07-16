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
      language:{
        code: string;
      },
      parameters: any[]
    ) => {
      try {
        setLoading(true);
        setError(null);

        const payload = {
          templateName,
          body,
          language:{
            code: language.code,
          },
          messages: [
            {
              to,
              parameters,
            },
          ],
        };

        console.log("✅ Payload enviado:", payload);

        const data = await sendTemplateMessage(payload);
        setResult(data);
        console.log("✅ Respuesta:", data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Error al enviar la plantilla"
        );
        console.log(err);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { sendTemplate, loading, error, result };
}