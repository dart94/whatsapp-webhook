// Vista principal de las conversaciones por número de teléfono
"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { PageHeader } from "../components/PageHeader";
import { ConversationList } from "../components/ConversationList";
import { Conversation } from "../types/whatsapp";
import { useSocket } from "../hooks/UseSocket";
import { useConversationStore } from "../stores/UseConversationStore";
import { useGroups } from "../hooks/useGroups";

// 👇 ajusta si tienes un archivo centralizado de config
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

type HomeProps = {
  onSelectChat: (waId: string) => void;
};

type Group = { id: number; name: string };

export default function Message({ onSelectChat }: HomeProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const {
    conversations = [],
    loading,
    error,
    refreshConversations,
  } = useConversationStore();

  
  // Token del storage (solo en cliente)
  const [token, setToken] = useState<string | null>(null);
  useEffect(() => {
    const t =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;
    setToken(t);
  }, []);
  const {
    groups,
    loading: groupsLoading,
    error: groupsError,
  } = useGroups(token);

  // Lee groupId de la URL (?groupId=123)
  const groupIdFromQuery = useMemo(() => {
    const raw = searchParams.get("groupId");
    if (!raw) return undefined;
    const n = Number(raw);
    return Number.isNaN(n) ? undefined : n;
  }, [searchParams]);

  const [selectedGroupId, setSelectedGroupId] = useState<number | undefined>(
    groupIdFromQuery
  );

  // Sincroniza estado local con la URL (si cambia por navegación externa)
  useEffect(() => {
    setSelectedGroupId(groupIdFromQuery);
  }, [groupIdFromQuery]);

  // fetch grupos 
  

  // Auto-seleccionar si solo hay 1 grupo (sin pisar selección existente)
  useEffect(() => {
    if (
      !groupsLoading &&
      groups.length === 1 &&
      selectedGroupId === undefined
    ) {
      const onlyGroup = groups[0];
      setSelectedGroupId(onlyGroup.id);

      // Sincroniza con la URL (?groupId=)
      const params = new URLSearchParams(searchParams.toString());
      params.set("groupId", String(onlyGroup.id));
      router.replace(`?${params.toString()}`);
    }
  }, [groupsLoading, groups, selectedGroupId, router, searchParams]);

  // Nombre del grupo seleccionado (para el subtítulo)
  const selectedGroupName = useMemo(() => {
    if (selectedGroupId === undefined) return undefined;
    return (
      groups.find((g) => g.id === selectedGroupId)?.name ??
      `Grupo ${selectedGroupId}`
    );
  }, [selectedGroupId, groups]);

  // Refresca conversaciones (respetando el grupo seleccionado)
  const doRefresh = useCallback(
    async (gid?: number) => {
      if (!token) return; // no llames sin token
      await refreshConversations(
        token,
        gid !== undefined ? { groupId: gid } : undefined
      );
    },
    [token, refreshConversations]
  );

  // Primera carga / cambios de grupo (solo con token)
  useEffect(() => {
    if (!token) return;
    void doRefresh(selectedGroupId);
  }, [token, selectedGroupId, doRefresh]);

  // Click en una conversación
  const handleConversationClick = (conversation: Conversation) => {
    onSelectChat(conversation.wa_id);
  };

  // Botón “Actualizar”
  const handleRefresh = () => {
    if (!token) return;
    void doRefresh(selectedGroupId);
  };

  // Socket: refresca respetando el grupo actual
  useSocket(() => {
    if (!token) return;
    void doRefresh(selectedGroupId);
  });

  // Cambio en el select: actualiza estado + URL
  const handleChangeGroup = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    const gid = value === "" ? undefined : Number(value);
    setSelectedGroupId(gid);

    const params = new URLSearchParams(searchParams.toString());
    if (gid === undefined) {
      params.delete("groupId");
    } else {
      params.set("groupId", String(gid));
    }
    router.replace(`?${params.toString()}`);
  };

  // Render de error global de conversaciones
  if (error) {
    return (
      <main className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
              <span className="text-red-500 text-2xl">⚠️</span>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Error al cargar conversaciones
            </h3>
            <p className="text-gray-500 mb-4">{error}</p>
            <button
              onClick={handleRefresh}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              Reintentar
            </button>
          </div>
        </div>
      </main>
    );
  }

  const subtitle = `${conversations?.length ?? 0} conversaciones activas${
    selectedGroupName ? ` • ${selectedGroupName}` : ""
  }`;

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <PageHeader
          title="Conversaciones"
          subtitle={subtitle}
          actions={
            <div className="flex items-center gap-2">
              {/* Selector de grupo */}
              <div className="relative">
                <select
                  value={selectedGroupId ?? ""}
                  onChange={handleChangeGroup}
                  disabled={groupsLoading}
                  className="bg-white border border-gray-300 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  <option value="">
                    {groupsLoading ? "Cargando grupos..." : "Todos los grupos"}
                  </option>
                  {groups.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.name ?? `Grupo ${g.id}`}
                    </option>
                  ))}
                </select>
              </div>

              {/* Botón Actualizar */}
              <button
                onClick={handleRefresh}
                disabled={loading}
                className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                {loading ? "Cargando..." : "Actualizar"}
              </button>
            </div>
          }
        />

        {/* Error de grupos (no bloquea la vista de conversaciones) */}
        {groupsError && (
          <div className="mb-3 text-sm text-red-600">{groupsError}</div>
        )}

        <ConversationList
          conversations={conversations}
          loading={loading}
          onConversationClick={handleConversationClick}
        />

        {/* Estado vacío */}
        {!loading && conversations.length === 0 && (
          <div className="text-center text-gray-500 py-8">
            {selectedGroupId
              ? "No hay conversaciones para este grupo."
              : "No hay conversaciones aún."}
          </div>
        )}
      </div>
    </main>
  );
}
