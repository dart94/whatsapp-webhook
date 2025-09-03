// Vista principal de las conversaciones por número de teléfono
"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { PageHeader } from "../components/PageHeader";
import { ConversationList } from "../components/ConversationList";
import { Conversation } from "../types/whatsapp";
import { useSocket } from "../hooks/UseSocket";
import { useConversationStore } from "../stores/UseConversationStore";
import { getStoredToken } from "@/utils/auth";
import { get } from "http";
import Search from "@/components/search/search";
import { ArrowPathIcon }from "@heroicons/react/24/outline";

// 👇 ajusta si tienes un archivo centralizado de config
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

type HomeProps = {
  onSelectChat: (waId: string) => void;
};

type Group = { id: number; name: string };

// Carga de grupos (puedes mover esto a /lib/groups.api.ts si prefieres)
async function fetchGroups(token?: string): Promise<Group[]> {
  if (!token) {
    getStoredToken();
  }

 try {
    const res = await fetch(`${API_BASE_URL}/groups`, {
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      cache: "no-store",
    });


    
    if (!res.ok) {
      // Obtener más detalles sobre el error
      const errorText = await res.text();
      console.error("Detalles del error de API:", errorText);
      throw new Error(`Error de API: ${res.status} - ${errorText}`);
    }
    
    const json = await res.json();
    console.log("Respuesta de API:", json);
    
    return json.data ?? [];
  } catch (error) {
    console.error("Error en fetchGroups:", error);
    throw error;
  }
}
export default function Message({ onSelectChat }: HomeProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const { conversations, loading, error, refreshConversations } =
    useConversationStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredConversations, setFilteredConversations] = useState<
    Conversation[]
  >([]);

  const [groups, setGroups] = useState<Group[]>([]);
  const [groupsLoading, setGroupsLoading] = useState(false);
  const [groupsError, setGroupsError] = useState<string | null>(null);

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

  // Maneja búsqueda
    useEffect(() => {
    if (!searchTerm) {
      setFilteredConversations(conversations);
    } else {
      const lower = searchTerm.toLowerCase();
      setFilteredConversations(
        conversations.filter(
          (c) =>
            c.wa_id.toLowerCase().includes(lower)  
        )
      );
    }
  }, [searchTerm, conversations]);



  // Sincroniza estado local con la URL (si cambia por navegación externa)
  useEffect(() => {
    setSelectedGroupId(groupIdFromQuery);
  }, [groupIdFromQuery]);

  // Carga inicial de grupos
  useEffect(() => {
    (async () => {
      try {
        setGroupsLoading(true);
        setGroupsError(null);

        const token =  getStoredToken();

        const data = await fetchGroups(token ?? "");
        setGroups(data);
      } catch (e) {
        console.error("Error al cargar grupos:", e);
        // Mensaje de error más descriptivo
        setGroupsError(
          e instanceof Error
            ? e.message
            : "Ocurrió un error al cargar los grupos."
        );
      } finally {
        setGroupsLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (!groupsLoading && groups.length === 1) {
      const onlyGroup = groups[0];

      // Actualiza el estado seleccionado
      setSelectedGroupId(onlyGroup.id);

      // Sincroniza con la URL (?groupId=)
      const params = new URLSearchParams(searchParams.toString());
      params.set("groupId", String(onlyGroup.id));
      router.replace(`?${params.toString()}`);
    }
  }, [groupsLoading, groups, router, searchParams]);

  // Refresca conversaciones (respetando el grupo seleccionado)
  const doRefresh = useCallback(
    async (gid?: number) => {
      await refreshConversations(
        gid !== undefined ? { groupId: gid } : undefined
      );
    },
    [refreshConversations]
  );

  // Primera carga de conversaciones
  useEffect(() => {
    doRefresh(selectedGroupId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedGroupId]);

  // Click en una conversación
  const handleConversationClick = (conversation: Conversation) => {
    onSelectChat(conversation.wa_id);
  };

  // Botón “Actualizar”
  const handleRefresh = () => {
    doRefresh(selectedGroupId);
  };

  // Socket: refresca respetando el grupo actual
  useSocket(() => {
    doRefresh(selectedGroupId);
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
    // Reemplaza la URL sin recargar
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

  const subtitle = `${conversations.length} conversaciones activas${
    selectedGroupId ? ` • Grupo ${selectedGroupId}` : ""
  }`;

return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <PageHeader
          title="Conversaciones"
          subtitle={subtitle}
          actions={
            <div className="flex items-center gap-2">
              {/* Buscador */}
              <Search onSearch={setSearchTerm} />

              {/* Botón Actualizar */}
              <button
                onClick={handleRefresh}
                disabled={loading}
                className="bg-purple-500 text-white p-2 rounded-full hover:bg-purple-600 disabled:opacity-50 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
              >
                <ArrowPathIcon className="w-5 h-5" />
              </button>

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

            </div>
          }
        />

        {/* Lista filtrada */}
        <ConversationList
          conversations={filteredConversations}
          loading={loading}
          onConversationClick={handleConversationClick}
        />

        {/* Estado vacío */}
        {!loading && filteredConversations.length === 0 && (
          <div className="text-center text-gray-500 py-8">
            {searchTerm
              ? "No hay resultados para tu búsqueda."
              : selectedGroupId
              ? "No hay conversaciones para este grupo."
              : "No hay conversaciones aún."}
          </div>
        )}
      </div>
    </main>
  );
}
