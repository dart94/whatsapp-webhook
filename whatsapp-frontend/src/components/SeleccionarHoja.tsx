'use client';
import { useState } from "react";
import { useRegisteredSheets } from "@/hooks/useRegisteredSheets";
import { getHeaders } from "@/lib/sheet.api"; // función que ya tienes
import { toast } from "sonner";
import { RegisteredSheet } from "@/types/sheet";

export default function SeleccionarHoja() {
  const { sheets, loading } = useRegisteredSheets();
  const [selectedSheetId, setSelectedSheetId] = useState("");
  const [headers, setHeaders] = useState<string[]>([]);

  const handleSelect = async (id: string) => {
    setSelectedSheetId(id);
    const sheet = sheets.find(s => s.id === id);
    if (!sheet) return;

    try {
      const headers = await getHeaders(sheet.spreadsheetId, sheet.sheetName);
      setHeaders(headers);
      toast.success("Encabezados cargados correctamente");
    } catch (error) {
      toast.error("Error al obtener encabezados");
      console.error(error);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-4 space-y-6">
      <div>
        <label className="block mb-1 text-sm font-medium text-gray-700">
          Selecciona una hoja registrada
        </label>
        <select
          value={selectedSheetId}
          onChange={(e) => handleSelect(e.target.value)}
          className="w-full border px-3 py-2 rounded"
        >
          <option value="">-- Seleccionar --</option>
          {sheets.map((sheet) => (
            <option key={sheet.id} value={sheet.id}>
              {sheet.name}
            </option>
          ))}
        </select>
      </div>

      {headers.length > 0 && (
        <div>
          <h4 className="font-semibold mb-2">Encabezados:</h4>
          <ul className="list-disc list-inside text-sm text-gray-700">
            {headers.map((h, i) => (
              <li key={i}>{h}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
