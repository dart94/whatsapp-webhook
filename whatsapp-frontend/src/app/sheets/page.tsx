"use client";

import { useState, useRef } from "react";
import { getHeaders } from "@/lib/sheet.api";
import { registerSheet } from "@/lib/sheet.api";
import { Input } from "../../components/ui/Inputs";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { CardContent } from "../../components/ui/CardContent";
import { showToast } from "../../components/common/Toast";
import { error } from "console";
import { useRouter } from "next/navigation";
import { Badge } from "../../components/ui/Badge";
import { Label } from "../../components/ui/Label";

export default function RegisterSheetForm() {
  const [name, setName] = useState("");
  const [spreadsheetId, setSpreadsheetId] = useState("");
  const [sheetName, setSheetName] = useState("");
  const [headers, setHeaders] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const nameInputRef = useRef<HTMLInputElement>(null);

  const router = useRouter();

  const handlePreviewHeaders = async () => {
    if (!spreadsheetId || !sheetName) {
      showToast({ message: "Falta el ID o el nombre de la hoja" });
      return;
    }
    setLoading(true);
    try {
      const data = await getHeaders(spreadsheetId, sheetName);

      if (!Array.isArray(data)) {
        showToast({
          type: "error",
          message: "No se pudieron obtener los encabezados",
        });
        console.error("❌ Respuesta inválida:", data);
        return;
      }

      setHeaders(data);
      showToast({ message: "Encabezados obtenidos correctamente" });
    } catch (err) {
      showToast({ type: "error", message: "Error al obtener encabezados" });
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!name || !spreadsheetId || !sheetName || headers.length === 0) {
      showToast({
        type: "error",
        message: "Completa todos los campos y obtén los encabezados",
      });
      return;
    }
    try {
      await registerSheet(name, spreadsheetId, sheetName);
      showToast({ type: "success", message: "Hoja registrada correctamente" });

      // Actualizar la lista después de registrar
      setName("");
      setSpreadsheetId("");
      setSheetName("");
      setHeaders([]);
      // Scroll to top
      window.scrollTo({ top: 0, behavior: "smooth" });

      //Enfoque al nombre de la hoja
      nameInputRef.current?.focus();
    } catch (err) {
      showToast({ message: "Error al registrar la hoja", type: "error" });
      console.error(err);
    }
  };

  return (
    <Card className="max-w-xl mx-auto mt-10 shadow-lg rounded-2xl">
      <CardContent className="space-y-6 py-8 px-6">
        <h2 className="text-2xl font-bold text-center text-gray-800">
          Registrar hoja de Google Sheets
        </h2>

        <div className="space-y-2">
          <Label htmlFor="name">Nombre personalizado</Label>
          <Input
            id="name"
            ref={nameInputRef}
            placeholder="Ej. Clientes julio"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="spreadsheetId">Spreadsheet ID</Label>
          <Input
            id="spreadsheetId"
            placeholder="Ingresa el ID del documento"
            value={spreadsheetId}
            onChange={(e) => setSpreadsheetId(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="sheetName">Nombre de la hoja</Label>
          <Input
            id="sheetName"
            placeholder="Ej. Hoja1"
            value={sheetName}
            onChange={(e) => setSheetName(e.target.value)}
          />
        </div>

        <div className="flex justify-center">
          <Button
            onClick={handlePreviewHeaders}
            disabled={loading || !spreadsheetId || !sheetName}
            className="w-full sm:w-auto"
          >
            {loading ? "Cargando..." : "Obtener encabezados"}
          </Button>
        </div>

        {headers.length > 0 && (
          <div className="border-t pt-4 mt-6">
            <h4 className="font-semibold text-gray-700 mb-2">
              Encabezados encontrados:
            </h4>
            <div className="flex flex-wrap gap-2">
              {headers.map((h, i) => (
                <Badge key={i} variant="outline" className="text-sm">
                  {h}
                </Badge>
              ))}
            </div>
            <div className="mt-6 flex justify-center">
              <Button onClick={handleSave} disabled={loading}>
                {loading ? "Guardando..." : "Guardar hoja"}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
