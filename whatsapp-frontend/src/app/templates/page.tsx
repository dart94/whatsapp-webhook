"use client";

import { useTemplates } from "../../hooks/UseTemplates";
import { Template } from "../../types/whatsapp";
import { ChatBubbleLeftIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";


export default function TemplatesPage() {
  const { templates, loading, error } = useTemplates();

  return (
    <div className="max-w-7xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">Plantillas</h1>

      {loading ? (
        <p className="text-gray-500 text-sm">Cargando plantillas...</p>
      ) : error ? (
        <p className="text-red-500">Error: {error}</p>
      ) : (
        <div className="overflow-x-auto border rounded-xl shadow-sm bg-white">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 border-b text-xs text-gray-600 uppercase">
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
            <tbody className="divide-y divide-gray-200 text-gray-800">
              {templates.map((template: Template) => (
                <tr key={template.id} className="hover:bg-gray-50 transition">
                  <td className="px-4 py-3 font-semibold">{template.name}</td>
                  <td className="px-4 py-3">{template.language}</td>
                  <td className="px-4 py-3">
                    <Badge variant="outline">{template.category}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      
                    >
                      {template.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    {template.header || (
                      <span className="text-gray-400 italic">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 max-w-xs truncate">
                    {template.body || <span className="text-gray-400">—</span>}
                  </td>
                  <td className="px-4 py-3">
                    {template.footer || <span className="text-gray-400">—</span>}
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/templates/enviarplantilla?id=${template.id}`}>
                      <Button variant="outline" size="sm" className="flex gap-1">
                        <ChatBubbleLeftIcon className="w-4 h-4" />
                        Enviar
                      </Button>
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
