"use client";
import { useSearchParams } from "next/navigation";
import { useTemplates } from "../../../hooks/UseTemplates";
import { useState, useEffect } from "react";
import { useSendTemplate } from "../../../hooks/useSendTemplate";
import { Template } from "../../../types/whatsapp";
import { 
  PaperAirplaneIcon, 
  CheckCircleIcon, 
  XCircleIcon,
  ClockIcon,
  UserGroupIcon,
  DocumentTextIcon,
  EyeIcon,
  EyeSlashIcon
} from "@heroicons/react/24/solid";
import { useRegisteredSheets } from "@/hooks/useRegisteredSheets";
import { fetchSheetData } from "@/lib/sheet.api";
import { RegisteredSheet } from "@/types/sheet";

interface RecipientData {
  id: string;
  name: string;
  phone: string;
  variables: string[];
  status: 'pending' | 'sending' | 'sent' | 'error';
  error?: string;
  originalRowIndex: number;
}

interface SheetRowData {
  [key: string]: string | number | undefined;
  Celular?: string;
  Whatsapp?: string;
  Telefono?: string;
  Nombre?: string;
  Name?: string;
}

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
  
  const { sheets, loading: loadingSheets } = useRegisteredSheets();
  
  // Estados principales
  const [selectedSheet, setSelectedSheet] = useState<RegisteredSheet | null>(null);
  const [sheetData, setSheetData] = useState<SheetRowData[]>([]);
  const [recipients, setRecipients] = useState<RecipientData[]>([]);
  const [selectedRecipients, setSelectedRecipients] = useState<Set<string>>(new Set());
  const [globalParameters, setGlobalParameters] = useState<string[]>([]);
  const [sendingProgress, setSendingProgress] = useState({ current: 0, total: 0 });
  const [bulkSendingMode, setBulkSendingMode] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [useGlobalVars, setUseGlobalVars] = useState(false);
  const [variableMapping, setVariableMapping] = useState<string[]>([]);
  const [phoneColumn, setPhoneColumn] = useState<string>('');
  const [nameColumn, setNameColumn] = useState<string>('');
  
  const template = templates.find((t: Template) => t.id === templateId);
  const variableCount = template?.body?.match(/{{\d+}}/g)?.length || 0;


 // Actualizar mapeo de variables
  const updateVariableMapping = (variableIndex: number, headerName: string) => {
    const newMapping = [...variableMapping];
    newMapping[variableIndex] = headerName;
    setVariableMapping(newMapping);
  };  // Procesar recipients cuando cambian las configuraciones
  useEffect(() => {
    if (!selectedSheet || !sheetData.length || !phoneColumn) return;
    
    const processedRecipients: RecipientData[] = sheetData.map((row: SheetRowData, index: number) => {
      const phone = String(row[phoneColumn] || "");
      const name = String(row[nameColumn] || `Contacto ${index + 1}`);
      
      // Extraer variables según el mapeo seleccionado
      const variables = variableMapping.map(mappedHeader => {
        return String(row[mappedHeader] || "");
      });
      
      return {
        id: `recipient-${index}`,
        name,
        phone,
        variables,
        status: 'pending' as const,
        originalRowIndex: index
      };
    });
    
    setRecipients(processedRecipients);
    setSelectedRecipients(new Set());
  }, [sheetData, variableMapping, phoneColumn, nameColumn, selectedSheet]);


  
  // Inicializar parámetros globales y mapeo de variables
  useEffect(() => {
    setGlobalParameters(Array(variableCount).fill(""));
    setVariableMapping(Array(variableCount).fill(""));
  }, [variableCount]);
  
  // Cargar datos de la hoja seleccionada
  useEffect(() => {
    if (!selectedSheet) return;
    
    const loadSheetData = async () => {
      try {
        const data = await fetchSheetData(
          selectedSheet.spreadsheetId,
          selectedSheet.sheetName
        );
        setSheetData(data);
        
        // Procesar datos y crear recipients
        const processedRecipients: RecipientData[] = data.map((row: SheetRowData, index: number) => {
          const phone = String(row.Celular || row.Whatsapp || row.Telefono || "");
          const name = String(row.Nombre || row.Name || `Contacto ${index + 1}`);
          
          // Extraer variables automáticamente según los headers
          const variables = Array(variableCount).fill("").map((_, i) => {
            const header = selectedSheet.headers[i];
            return String(row[header] || "");
          });
          
          return {
            id: `recipient-${index}`,
            name,
            phone,
            variables,
            status: 'pending' as const,
            originalRowIndex: index
          };
        });
        
        setRecipients(processedRecipients);
        setSelectedRecipients(new Set());
      } catch (error) {
        console.error("Error loading sheet data:", error);
      }
    };
    
    loadSheetData();
  }, [selectedSheet, variableCount]);
  
  // Funciones de selección
  const toggleRecipient = (id: string) => {
    const newSelected = new Set(selectedRecipients);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedRecipients(newSelected);
  };
  
  const selectAll = () => {
    const validRecipients = recipients.filter(r => r.phone.trim().length >= 10);
    setSelectedRecipients(new Set(validRecipients.map(r => r.id)));
  };
  
  const deselectAll = () => {
    setSelectedRecipients(new Set());
  };
  
  // Actualizar variables de un destinatario específico
  const updateRecipientVariable = (recipientId: string, index: number, value: string) => {
    setRecipients(prev => 
      prev.map(r => 
        r.id === recipientId 
          ? { ...r, variables: r.variables.map((v, i) => i === index ? value : v) }
          : r
      )
    );
  };
  
  // Actualizar parámetros globales
  const handleGlobalParamChange = (index: number, value: string) => {
    const updated = [...globalParameters];
    updated[index] = value;
    setGlobalParameters(updated);
  };
  
  // Función de envío masivo
  const handleBulkSend = async () => {
    if (!template || selectedRecipients.size === 0) return;
    
    setBulkSendingMode(true);
    setSendingProgress({ current: 0, total: selectedRecipients.size });
    
    const selectedRecipientsList = recipients.filter(r => selectedRecipients.has(r.id));
    
    for (let i = 0; i < selectedRecipientsList.length; i++) {
      const recipient = selectedRecipientsList[i];
      
      // Actualizar estado a enviando
      setRecipients(prev => 
        prev.map(r => 
          r.id === recipient.id 
            ? { ...r, status: 'sending' }
            : r
        )
      );
      
      try {
        const parametersToUse = useGlobalVars ? globalParameters : recipient.variables;
        
        await sendTemplate(
          recipient.phone,
          template.name,
          template.body,
          template.language,
          parametersToUse
        );
        
        // Actualizar estado a enviado
        setRecipients(prev => 
          prev.map(r => 
            r.id === recipient.id 
              ? { ...r, status: 'sent' }
              : r
          )
        );
        
      } catch (error) {
        // Actualizar estado a error
        setRecipients(prev => 
          prev.map(r => 
            r.id === recipient.id 
              ? { ...r, status: 'error' }
              : r
          )
        );
      }
      
      setSendingProgress({ current: i + 1, total: selectedRecipients.size });
      
      // Pausa entre envíos para evitar rate limiting
      if (i < selectedRecipientsList.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    setBulkSendingMode(false);
  };
  
  // Generar vista previa del mensaje
  const generatePreview = (variables: string[]) => {
    if (!template) return "";
    
    let preview = template.body;
    variables.forEach((variable, index) => {
      const placeholder = `{{${index + 1}}}`;
      preview = preview.replace(new RegExp(placeholder, 'g'), variable || `[Variable ${index + 1}]`);
    });
    
    return preview;
  };
  
  // Estados de carga y error
  if (loadingTemplates) {
    return (
      <div className="space-y-4 p-4 max-w-4xl mx-auto">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-10 w-full bg-gray-200 rounded animate-pulse"></div>
        ))}
      </div>
    );
  }
  
  if (errorTemplates) {
    return (
      <div className="max-w-4xl mx-auto mt-10 text-red-500 text-center">
        <XCircleIcon className="w-12 h-12 mx-auto mb-4" />
        <p>Error: {errorTemplates}</p>
      </div>
    );
  }
  
  if (!template) {
    return (
      <div className="max-w-4xl mx-auto mt-10 text-gray-500 text-center">
        <DocumentTextIcon className="w-12 h-12 mx-auto mb-4" />
        <p>No se encontró la plantilla.</p>
      </div>
    );
  }
  
  const selectedCount = selectedRecipients.size;
  const validRecipients = recipients.filter(r => r.phone.trim().length >= 10);
  const sentCount = recipients.filter(r => r.status === 'sent').length;
  const errorCount = recipients.filter(r => r.status === 'error').length;
  
  return (
    <div className="max-w-6xl mx-auto py-6 px-4">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Envío Masivo de WhatsApp
        </h1>
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-600">
            {selectedCount} seleccionados de {validRecipients.length} disponibles
          </div>
        </div>
      </div>
      
      
      {/* Selección de Hoja */}
      <div className="bg-white shadow-lg rounded-xl p-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Seleccionar Datos de Origen
        </h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Hoja de cálculo registrada
            </label>
            <select
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={selectedSheet?.id || ""}
              onChange={(e) => {
                const found = sheets.find((s) => s.id === e.target.value);
                setSelectedSheet(found || null);
                setRecipients([]);
                setSelectedRecipients(new Set());
                setVariableMapping([]);
                setPhoneColumn('');
                setNameColumn('');
              }}
            >
              <option value="">-- Selecciona una hoja --</option>
              {sheets.map((sheet) => (
                <option key={sheet.id} value={sheet.id}>
                  {sheet.name}
                </option>
              ))}
            </select>
          </div>
          
          {selectedSheet && (
            <div className="space-y-4">
              <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
                <strong>Headers disponibles:</strong> {selectedSheet.headers.join(", ")}
              </div>
              
              {/* Configuración de columnas principales */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Columna de teléfono/WhatsApp
                  </label>
                  <select
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={phoneColumn}
                    onChange={(e) => setPhoneColumn(e.target.value)}
                  >
                    <option value="">-- Selecciona columna --</option>
                    {selectedSheet.headers.map((header) => (
                      <option key={header} value={header}>
                        {header}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Columna de nombre
                  </label>
                  <select
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={nameColumn}
                    onChange={(e) => setNameColumn(e.target.value)}
                  >
                    <option value="">-- Selecciona columna --</option>
                    {selectedSheet.headers.map((header) => (
                      <option key={header} value={header}>
                        {header}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Variables y Mapeo */}
      {variableCount > 0 && selectedSheet && (
        <div className="bg-white shadow-lg rounded-xl p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-800">
              Mapeo de Variables del Mensaje
            </h3>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={useGlobalVars}
                onChange={(e) => setUseGlobalVars(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">
                Usar valores fijos para todas las variables
              </span>
            </label>
          </div>
          
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="text-sm font-medium text-gray-700 mb-2">Vista previa del mensaje:</div>
            <div className="text-sm text-gray-900 whitespace-pre-wrap font-mono bg-white p-3 rounded border">
              {template.body}
            </div>
          </div>
          
          {useGlobalVars ? (
            <div className="space-y-4">
              <div className="text-sm text-gray-600 mb-4">
                Configura valores fijos que se usarán para todos los destinatarios:
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: variableCount }).map((_, i) => (
                  <div key={i}>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Variable {i + 1}
                    </label>
                    <input
                      type="text"
                      value={globalParameters[i] || ""}
                      onChange={(e) => handleGlobalParamChange(i, e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder={`Valor fijo para {{${i + 1}}}`}
                    />
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-sm text-gray-600 mb-4">
                Selecciona qué columna de la hoja corresponde a cada variable del mensaje:
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: variableCount }).map((_, i) => (
                  <div key={i}>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Variable {i + 1}
                    </label>
                    <select
                      value={variableMapping[i] || ""}
                      onChange={(e) => updateVariableMapping(i, e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">-- Selecciona columna --</option>
                      {selectedSheet.headers.map((header) => (
                        <option key={header} value={header}>
                          {header}
                        </option>
                      ))}
                    </select>
                    {variableMapping[i] && (
                      <div className="mt-2 text-xs text-gray-500">
                        Tomará valores de la columna "{variableMapping[i]}"
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* Lista de Destinatarios */}
      {recipients.length > 0 && phoneColumn && (
        <div className="bg-white shadow-lg rounded-xl p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-800">
              Destinatarios ({recipients.length})
            </h3>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                Teléfonos desde: <span className="font-medium">{phoneColumn}</span>
                {nameColumn && (
                  <>, nombres desde: <span className="font-medium">{nameColumn}</span></>
                )}
              </div>
              <button
                onClick={() => setShowPreview(!showPreview)}
                className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-800"
              >
                {showPreview ? <EyeSlashIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                <span>{showPreview ? 'Ocultar' : 'Mostrar'} vista previa</span>
              </button>
              <div className="flex space-x-2">
                <button
                  onClick={selectAll}
                  className="text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded-lg hover:bg-blue-200"
                >
                  Seleccionar válidos
                </button>
                <button
                  onClick={deselectAll}
                  className="text-sm bg-gray-100 text-gray-700 px-3 py-1 rounded-lg hover:bg-gray-200"
                >
                  Deseleccionar todo
                </button>
              </div>
            </div>
          </div>
          
          {/* Estadísticas */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{selectedCount}</div>
              <div className="text-sm text-blue-700">Seleccionados</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{sentCount}</div>
              <div className="text-sm text-green-700">Enviados</div>
            </div>
            <div className="bg-red-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-red-600">{errorCount}</div>
              <div className="text-sm text-red-700">Errores</div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-gray-600">{validRecipients.length}</div>
              <div className="text-sm text-gray-700">Válidos</div>
            </div>
          </div>
          
          {/* Lista de destinatarios */}
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {recipients.map((recipient) => {
              const isSelected = selectedRecipients.has(recipient.id);
              const isValid = recipient.phone.trim().length >= 10;
              const parametersToUse = useGlobalVars ? globalParameters : recipient.variables;
              
              return (
                <div
                  key={recipient.id}
                  className={`border rounded-lg p-4 transition-all ${
                    isSelected 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  } ${!isValid ? 'opacity-50' : ''}`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleRecipient(recipient.id)}
                        disabled={!isValid}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <div>
                        <div className="font-medium text-gray-900">{recipient.name}</div>
                        <div className="text-sm text-gray-600">{recipient.phone}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {recipient.status === 'pending' && (
                        <ClockIcon className="w-5 h-5 text-gray-400" />
                      )}
                      {recipient.status === 'sending' && (
                        <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                      )}
                      {recipient.status === 'sent' && (
                        <CheckCircleIcon className="w-5 h-5 text-green-600" />
                      )}
                      {recipient.status === 'error' && (
                        <XCircleIcon className="w-5 h-5 text-red-600" />
                      )}
                    </div>
                  </div>
                  
                  {!useGlobalVars && variableCount > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-3">
                      {Array.from({ length: variableCount }).map((_, i) => (
                        <div key={i}>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Variable {i + 1}
                          </label>
                          <input
                            type="text"
                            value={recipient.variables[i] || ""}
                            onChange={(e) => updateRecipientVariable(recipient.id, i, e.target.value)}
                            className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                            placeholder={`Valor {{${i + 1}}}`}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {showPreview && (
                    <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                      <div className="text-xs font-medium text-gray-600 mb-2">Vista previa:</div>
                      <div className="text-sm text-gray-900 whitespace-pre-wrap">
                        {generatePreview(parametersToUse)}
                      </div>
                    </div>
                  )}
                  
                  {recipient.status === 'error' && recipient.error && (
                    <div className="mt-3 p-3 bg-red-50 rounded-lg">
                      <div className="text-xs font-medium text-red-600 mb-1">Error:</div>
                      <div className="text-sm text-red-700">{recipient.error}</div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
      
      {/* Envío Masivo */}
      {recipients.length > 0 && (
        <div className="bg-white shadow-lg rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Envío Masivo
          </h3>
          
          {bulkSendingMode && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">
                  Progreso del envío
                </span>
                <span className="text-sm text-gray-600">
                  {sendingProgress.current} / {sendingProgress.total}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(sendingProgress.current / sendingProgress.total) * 100}%` }}
                />
              </div>
            </div>
          )}
          
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              {selectedCount > 0 ? (
                <>Se enviará a {selectedCount} destinatario{selectedCount > 1 ? 's' : ''} seleccionado{selectedCount > 1 ? 's' : ''}.</>
              ) : (
                <>Selecciona destinatarios para habilitar el envío masivo.</>
              )}
            </div>
            
            <button
              onClick={handleBulkSend}
              disabled={selectedCount === 0 || bulkSendingMode}
              className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {bulkSendingMode ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Enviando...</span>
                </>
              ) : (
                <>
                  <UserGroupIcon className="w-5 h-5" />
                  <span>Enviar a Seleccionados</span>
                </>
              )}
            </button>
          </div>
          
          {sendError && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="text-sm text-red-700">
                <strong>Error:</strong> {sendError}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}