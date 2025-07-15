"use client";

import { useTemplates } from "../../hooks/UseTemplates";
import { Template } from "../../types/whatsapp";
import { ChatBubbleLeftIcon } from "@heroicons/react/24/outline";
import Link from "next/link";

export default function TemplatesPage() {
  const { templates, loading, error } = useTemplates();

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Plantillas</h1>

      {loading ? (
        <p className="text-gray-600">Cargando...</p>
      ) : error ? (
        <p className="text-red-500">Error: {error}</p>
      ) : (
        <div className="overflow-x-auto border border-gray-200 rounded-lg">
          <table className="min-w-full text-sm text-gray-800">
            <thead className="bg-gray-100 text-gray-700 uppercase text-xs">
              <tr>
                <th className="px-4 py-3 text-left">Nombre</th>
                <th className="px-4 py-3 text-left">Lenguaje</th>
                <th className="px-4 py-3 text-left">Categoría</th>
                <th className="px-4 py-3 text-left">Estado</th>
                <th className="px-4 py-3 text-left">Header</th>
                <th className="px-4 py-3 text-left">Body</th>
                <th className="px-4 py-3 text-left">Footer</th>
                <th className="px-4 py-3 text-left">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {templates.map((template: Template) => (
                <tr key={template.id}>
                  <td className="px-4 py-2 font-medium">{template.name}</td>
                  <td className="px-4 py-2">{template.language}</td>
                  <td className="px-4 py-2">{template.category}</td>
                  <td className="px-4 py-2">{template.status}</td>
                  <td className="px-4 py-2">
                    {template.header || (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-4 py-2">
                    {template.body || <span className="text-gray-400">-</span>}
                  </td>
                  <td className="px-4 py-2">
                    {template.footer || (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-4 py-2">
                    <Link
                      href={`/templates/enviarplantilla?id=${template.id}`}
                      className="flex items-center space-x-1 text-blue-600 hover:underline text-xs"
                    >
                      <ChatBubbleLeftIcon className="w-4 h-4" />
                      <span>Enviar</span>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
