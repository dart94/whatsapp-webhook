"use client";

import { useSearchParams } from "next/navigation";
import { useTemplates } from "../../../hooks/UseTemplates";
import { useState } from "react";
import { useSendTemplate } from "../../../hooks/useSendTemplate";
import { Template } from "../../../types/whatsapp";
import { PaperAirplaneIcon } from "@heroicons/react/24/solid";

export default function EnviarPlantillaPage() {
  const searchParams = useSearchParams();
  const templateId = searchParams.get("id") ?? "";

  const {
    templates,
    loading: loadingTemplates,
    error: errorTemplates,
  } = useTemplates();
  const {
    sendTemplate,
    loading: sending,
    error: sendError,
    result,
  } = useSendTemplate();

  const [to, setTo] = useState("");
  const [parameters, setParameters] = useState<string[]>([]);

  const template = templates.find((t: Template) => t.id === templateId);

  const variableCount = template?.body?.match(/{{\d+}}/g)?.length || 0;

  const handleParamChange = (index: number, value: string) => {
    const updated = [...parameters];
    updated[index] = value;
    setParameters(updated);
  };

  const handleSubmit = async () => {
    if (!template) return;
    await sendTemplate(
      to,
      template.name,
      template.body,
      template.language,
      parameters
    );
  };

  if (loadingTemplates) {
    return (
      <div className="space-y-4 p-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-10 w-full bg-gray-200 rounded animate-pulse"
          ></div>
        ))}
      </div>
    );
  }

  if (errorTemplates) {
    return (
      <div className="max-w-xl mx-auto mt-10 text-red-500 text-center">
        Error: {errorTemplates}
      </div>
    );
  }

  if (!template) {
    return (
      <div className="max-w-xl mx-auto mt-10 text-gray-500 text-center">
        No se encontró la plantilla.
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-extrabold text-gray-800 mb-8">
        Enviar Plantilla
      </h1>

      {/* PLANTILLA CARD */}
      <div className="bg-white shadow rounded-lg p-6 mb-8 border border-gray-200">
        <h2 className="text-xl font-bold text-gray-800 mb-2">
          {template.name}
        </h2>
        <div className="grid grid-cols-2 gap-4 text-sm text-gray-700">
          <div>
            <span className="font-medium">Idioma:</span> {template.language}
          </div>
          <div>
            <span className="font-medium">Categoría:</span> {template.category}
          </div>
          <div>
            <span className="font-medium">Estado:</span> {template.status}
          </div>
          <div>
            <span className="font-medium">Header:</span>{" "}
            {template.header || "-"}
          </div>
          <div className="col-span-2">
            <span className="font-medium">Body:</span>
            <p className="mt-1 text-gray-900 whitespace-pre-wrap">
              {template.body}
            </p>
          </div>
          {template.footer && (
            <div className="col-span-2">
              <span className="font-medium">Footer:</span>
              <p className="mt-1 text-gray-900">{template.footer}</p>
            </div>
          )}
        </div>
      </div>

      {/* FORM */}
      <div className="space-y-6">
        {/* Phone input */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Número destinatario (WhatsApp)
          </label>
          <input
            type="text"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
            placeholder="Ej. 521XXXXXXXXXX"
          />
        </div>

        {/* Dynamic variables */}
        {variableCount > 0 && (
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-700">
              Variables del mensaje:
            </h3>
            {Array.from({ length: variableCount }).map((_, i) => (
              <input
                key={i}
                type="text"
                value={parameters[i] || ""}
                onChange={(e) => handleParamChange(i, e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder={`Valor para {{${i + 1}}}`}
              />
            ))}
          </div>
        )}

        {/* Submit button */}
        <button
          onClick={handleSubmit}
          disabled={sending}
          className="w-full inline-flex justify-center items-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-md transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {sending ? (
            "Enviando..."
          ) : (
            <>
              <PaperAirplaneIcon className="w-5 h-5 mr-2" />
              Enviar Plantilla
            </>
          )}
        </button>

        {/* Error */}
        {sendError && <p className="text-red-600 text-sm">{sendError}</p>}

        {/* Success */}
        {result && result.length > 0 && (
          <div className="mt-4 bg-green-50 border border-green-300 text-green-800 p-4 rounded">
            Plantilla enviada correctamente.
            <pre className="mt-2 text-xs bg-green-100 p-2 rounded overflow-x-auto">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
